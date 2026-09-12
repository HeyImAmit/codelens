const amqp = require("amqplib");
require("dotenv").config();
const pool = require("./config/db");
const { executeJavaSubmission } = require("./services/execution/javaExecutor");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const QUEUE_NAME = "code-execution";

let connection = null;
let channel = null;

const startWorker = async () => {
    try {
        connection = await amqp.connect(RABBITMQ_URL);
        console.log("Connected to RabbitMQ");

        channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        // Ensure fair dispatch: process 1 job at a time per worker
        channel.prefetch(1);

        console.log("Execution worker started");

        channel.consume(
            QUEUE_NAME,
            async (msg) => {
                if (!msg) return;

                let data;
                try {
                    const content = msg.content.toString();
                    data = JSON.parse(content);
                } catch (parseError) {
                    console.error("Malformed JSON payload in RabbitMQ message:", parseError.message);
                    channel.nack(msg, false, false);
                    return;
                }

                if (!data || !data.submissionId) {
                    console.error("Invalid message format (missing submissionId):", data);
                    channel.nack(msg, false, false);
                    return;
                }

                const submissionId = data.submissionId;
                console.log(`Received submission: ${submissionId}`);

                try {
                    // Fetch submission record from PostgreSQL
                    const result = await pool.query(
                        `SELECT id, problem_id, language, source_code, status
                         FROM submissions
                         WHERE id = $1`,
                        [submissionId]
                    );

                    if (result.rows.length === 0) {
                        console.warn(`Submission not found: ${submissionId}`);
                        channel.nack(msg, false, false);
                        return;
                    }

                    const submission = result.rows[0];

                    console.log(`Language: ${submission.language}`);
                    console.log(`Status: PENDING`);

                    // Check supported language for Milestone 3C (Java)
                    const lang = String(submission.language).toLowerCase();
                    if (lang !== "java") {
                        console.warn(`Language '${submission.language}' execution is not supported in Milestone 3C.`);
                        channel.nack(msg, false, false);
                        return;
                    }

                    // Transition status: PENDING -> RUNNING
                    await pool.query(
                        `UPDATE submissions SET status = 'RUNNING' WHERE id = $1`,
                        [submissionId]
                    );
                    console.log(`Execution started for submission ${submissionId}`);

                    // Execute Java code inside isolated Docker sandbox
                    const execResult = await executeJavaSubmission(submission.source_code);

                    // Update PostgreSQL record with execution metrics and status
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

                    console.log(`Execution completed for submission ${submissionId}`);
                    console.log(`  Final Status: ${execResult.status}`);
                    console.log(`  Execution Time: ${execResult.executionTime} ms`);

                    // Acknowledge RabbitMQ message after database update
                    channel.ack(msg);
                } catch (dbError) {
                    console.error(`Error processing execution for submission ${submissionId}:`, dbError.message);
                    channel.nack(msg, false, true);
                }
            },
            {
                noAck: false
            }
        );

        connection.on("error", (err) => {
            console.error("RabbitMQ Worker connection error:", err.message);
        });

        connection.on("close", () => {
            console.warn("RabbitMQ Worker connection closed.");
        });

    } catch (error) {
        console.error("Failed to start RabbitMQ worker:", error.message);
        process.exit(1);
    }
};

// Graceful shutdown handling
const handleShutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down worker cleanly...`);
    try {
        if (channel) await channel.close();
        if (connection) await connection.close();
        await pool.end();
        console.log("Worker cleanup complete. Exiting.");
        process.exit(0);
    } catch (err) {
        console.error("Error during worker shutdown:", err.message);
        process.exit(1);
    }
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

startWorker();
