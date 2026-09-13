const pool = require("../config/db");
const { publishToQueue } = require("../config/rabbitmq");
const { config } = require("../config/env");

const createSubmission = async (req, res, next) => {
    const requestId = req.requestId || "unknown";
    const reqLogger = req.logger;

    try {
        const {
            problemId,
            language,
            sourceCode
        } = req.body;

        if (!problemId || !language || !sourceCode) {
            return res.status(400).json({
                message: "problemId, language and sourceCode are required",
                requestId
            });
        }

        // Check whether problem exists
        const problem = await pool.query(
            `SELECT id FROM problems WHERE id = $1`,
            [problemId]
        );

        if (problem.rows.length === 0) {
            return res.status(404).json({
                message: "Problem not found",
                requestId
            });
        }

        // Insert submission into PostgreSQL
        const result = await pool.query(
            `INSERT INTO submissions
                (problem_id, language, source_code, status)
             VALUES
                ($1, $2, $3, 'PENDING')
             RETURNING *`,
            [problemId, language, sourceCode]
        );

        const submission = result.rows[0];

        reqLogger.info("Submission created", {
            submissionId: submission.id,
            problemId,
            language,
            status: "PENDING"
        });

        // Publish job to RabbitMQ queue with correlated requestId
        try {
            const queueName = config.rabbitmq.queueName;
            await publishToQueue(queueName, {
                submissionId: submission.id,
                requestId
            });

            reqLogger.info("Submission job published to RabbitMQ", {
                submissionId: submission.id,
                queue: queueName
            });
        } catch (queueError) {
            reqLogger.error("Failed to publish submission job to RabbitMQ", {
                submissionId: submission.id,
                error: queueError.message
            });
            return res.status(500).json({
                message: "Submission saved but failed to queue execution job",
                requestId
            });
        }

        res.status(201).json(submission);

    } catch (error) {
        next(error);
    }
};

const getSubmissionById = async (req, res, next) => {
    const requestId = req.requestId || "unknown";
    const reqLogger = req.logger;

    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT *
             FROM submissions
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Submission not found",
                requestId
            });
        }

        const submission = result.rows[0];
        reqLogger.debug("Fetched submission details", {
            submissionId: id,
            status: submission.status
        });

        res.json(submission);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createSubmission,
    getSubmissionById
};