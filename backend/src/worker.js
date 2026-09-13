const amqp = require("amqplib");
const crypto = require("crypto");
const { config } = require("./config/env");
const { Logger } = require("./utils/logger");
const pool = require("./config/db");
const { getTestCasesByProblemId } = require("./repositories/testCaseRepository");
const { executeJavaSubmission } = require("./services/execution/javaExecutor");

const workerLogger = new Logger({ service: "worker" });

const RABBITMQ_URL = config.rabbitmq.url;
const QUEUE_NAME = config.rabbitmq.queueName;
const PREFETCH_COUNT = config.rabbitmq.prefetchCount;

let connection = null;
let channel = null;
let consumerTag = null;
let isShuttingDown = false;
let activeJobPromise = null;

const startWorker = async () => {
    try {
        // 1. Verify PostgreSQL connectivity
        await pool.query("SELECT 1");
        workerLogger.info("PostgreSQL connected successfully", {
            dbHost: config.db.host,
            dbPort: config.db.port
        });

        // 2. Connect to RabbitMQ
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        // Ensure fair dispatch: process 1 job at a time per worker
        channel.prefetch(PREFETCH_COUNT);

        workerLogger.info("Execution worker started and listening", {
            queue: QUEUE_NAME,
            prefetch: PREFETCH_COUNT,
            url: RABBITMQ_URL.replace(/:\/\/.*@/, "://***@")
        });

        // 3. Start Consumer
        const consumeResult = await channel.consume(
            QUEUE_NAME,
            async (msg) => {
                if (!msg) return;

                if (isShuttingDown) {
                    // Reject and requeue message if worker is actively shutting down
                    channel.nack(msg, false, true);
                    return;
                }

                let data;
                try {
                    const content = msg.content.toString();
                    data = JSON.parse(content);
                } catch (parseError) {
                    workerLogger.error("Malformed JSON payload in RabbitMQ message", {
                        error: parseError.message
                    });
                    channel.nack(msg, false, false);
                    return;
                }

                if (!data || !data.submissionId) {
                    workerLogger.error("Invalid message format (missing submissionId)", { data });
                    channel.nack(msg, false, false);
                    return;
                }

                const submissionId = data.submissionId;
                // Backward compatibility: handle legacy messages without requestId
                const requestId = data.requestId || `legacy-${crypto.randomUUID().slice(0, 8)}`;
                const subLogger = workerLogger.child({ submissionId, requestId });

                subLogger.info("WORKER_RECEIVED: Message received from queue", {
                    queue: QUEUE_NAME
                });

                // Track active job execution for graceful shutdown
                let jobResolve;
                activeJobPromise = new Promise((resolve) => {
                    jobResolve = resolve;
                });

                try {
                    // Fetch submission record from PostgreSQL
                    const result = await pool.query(
                        `SELECT id, problem_id, language, source_code, status
                         FROM submissions
                         WHERE id = $1`,
                        [submissionId]
                    );

                    if (result.rows.length === 0) {
                        subLogger.warn("SUBMISSION_NOT_FOUND: Submission record does not exist in DB");
                        channel.nack(msg, false, false);
                        return;
                    }

                    const submission = result.rows[0];

                    subLogger.info("SUBMISSION_LOADED: Submission fetched from PostgreSQL", {
                        problemId: submission.problem_id,
                        language: submission.language,
                        initialStatus: submission.status
                    });

                    // Check supported language
                    const lang = String(submission.language).toLowerCase();
                    if (lang !== "java") {
                        subLogger.warn(`UNSUPPORTED_LANGUAGE: Language '${submission.language}' is not supported`);
                        channel.nack(msg, false, false);
                        return;
                    }

                    // Retrieve problem test cases
                    const testCases = await getTestCasesByProblemId(submission.problem_id);
                    subLogger.info("TEST_CASES_LOADED: Retrieved test cases for problem", {
                        problemId: submission.problem_id,
                        testCaseCount: testCases.length
                    });

                    // Transition status: PENDING -> RUNNING
                    await pool.query(
                        `UPDATE submissions SET status = 'RUNNING' WHERE id = $1`,
                        [submissionId]
                    );
                    subLogger.info("STATUS_RUNNING: Execution started in Docker sandbox");

                    // Evaluate Java code against test cases in Docker sandbox
                    const execResult = await executeJavaSubmission(submission.source_code, testCases);

                    // Update PostgreSQL record with final verdict status and metrics
                    await pool.query(
                        `UPDATE submissions
                         SET status = $1, output = $2, error = $3, execution_time = $4
                         WHERE id = $5`,
                        [
                            execResult.status,
                            execResult.output,
                            execResult.error,
                            execResult.executionTime,
                            submissionId
                        ]
                    );

                    subLogger.info("FINAL_VERDICT: Evaluation completed", {
                        verdict: execResult.status,
                        executionTimeMs: execResult.executionTime
                    });

                    // Acknowledge RabbitMQ message
                    channel.ack(msg);
                    subLogger.info("MESSAGE_ACK: Message acknowledged");
                } catch (dbError) {
                    subLogger.error("EXECUTION_ERROR: Error processing submission", {
                        error: dbError.message
                    });
                    channel.nack(msg, false, true);
                } finally {
                    if (jobResolve) jobResolve();
                    activeJobPromise = null;
                }
            },
            {
                noAck: false
            }
        );

        consumerTag = consumeResult.consumerTag;

        connection.on("error", (err) => {
            workerLogger.error("RabbitMQ Worker connection error", { error: err.message });
        });

        connection.on("close", () => {
            workerLogger.warn("RabbitMQ Worker connection closed.");
        });

    } catch (error) {
        workerLogger.error("Failed to start RabbitMQ execution worker", { error: error.message });
        process.exit(1);
    }
};

// Graceful shutdown handling
const handleShutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    workerLogger.info(`Received ${signal}. Shutting down worker gracefully...`);

    const shutdownTimeout = setTimeout(() => {
        workerLogger.error("Worker shutdown timed out after 10s. Forcing exit.");
        process.exit(1);
    }, 10000);
    shutdownTimeout.unref();

    try {
        // 1. Stop consuming new messages
        if (channel && consumerTag) {
            await channel.cancel(consumerTag);
            workerLogger.info("Stopped consuming new messages from queue.");
        }

        // 2. Wait for active execution to complete if in flight
        if (activeJobPromise) {
            workerLogger.info("Waiting for currently executing submission to complete...");
            await activeJobPromise;
            workerLogger.info("Active submission completed.");
        }

        // 3. Close RabbitMQ channel and connection
        if (channel) await channel.close();
        if (connection) await connection.close();
        workerLogger.info("RabbitMQ connection closed.");

        // 4. Close PostgreSQL pool
        await pool.end();
        workerLogger.info("PostgreSQL pool closed.");

        workerLogger.info("Worker shutdown complete. Exiting cleanly.");
        process.exit(0);
    } catch (err) {
        workerLogger.error("Error during worker shutdown", { error: err.message });
        process.exit(1);
    }
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

startWorker();

module.exports = { startWorker, handleShutdown };
