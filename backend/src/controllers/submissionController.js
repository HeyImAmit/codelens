const pool = require("../config/db");
const { publishToQueue } = require("../config/rabbitmq");
const { config } = require("../config/env");

const SUPPORTED_LANGUAGES = new Set(["java"]);
const MAX_SOURCE_CODE_LENGTH = config.execution.maxSourceCodeLength || 50000;

const createSubmission = async (req, res, next) => {
    const requestId = req.requestId || "unknown";
    const reqLogger = req.logger;

    try {
        const {
            problemId,
            language,
            sourceCode
        } = req.body;

        // 1. Validate required fields
        if (problemId === undefined || problemId === null || !language || sourceCode === undefined || sourceCode === null) {
            return res.status(400).json({
                message: "problemId, language and sourceCode are required",
                requestId
            });
        }

        // 2. Validate problemId is a positive integer
        const parsedProblemId = parseInt(problemId, 10);
        if (isNaN(parsedProblemId) || parsedProblemId <= 0 || !Number.isInteger(Number(problemId))) {
            return res.status(400).json({
                message: "problemId must be a positive integer",
                requestId
            });
        }

        // 3. Validate language
        if (typeof language !== "string" || language.trim().length === 0) {
            return res.status(400).json({
                message: "language must be a non-empty string",
                requestId
            });
        }

        const normLang = language.trim().toLowerCase();
        if (!SUPPORTED_LANGUAGES.has(normLang)) {
            return res.status(400).json({
                message: `Unsupported language: '${language}'. Supported: ${Array.from(SUPPORTED_LANGUAGES).join(", ")}`,
                requestId
            });
        }

        // 4. Validate sourceCode
        if (typeof sourceCode !== "string" || sourceCode.trim().length === 0) {
            return res.status(400).json({
                message: "sourceCode cannot be empty or whitespace only",
                requestId
            });
        }

        if (sourceCode.length > MAX_SOURCE_CODE_LENGTH) {
            return res.status(400).json({
                message: `sourceCode exceeds maximum allowed limit of ${MAX_SOURCE_CODE_LENGTH} characters`,
                requestId
            });
        }

        // 5. Check whether problem exists
        const problem = await pool.query(
            `SELECT id FROM problems WHERE id = $1`,
            [parsedProblemId]
        );

        if (problem.rows.length === 0) {
            return res.status(404).json({
                message: "Problem not found",
                requestId
            });
        }

        // 6. Insert submission into PostgreSQL
        const result = await pool.query(
            `INSERT INTO submissions
                (problem_id, language, source_code, status)
             VALUES
                ($1, $2, $3, 'PENDING')
             RETURNING *`,
            [parsedProblemId, normLang, sourceCode]
        );

        const submission = result.rows[0];

        reqLogger.info("Submission created", {
            submissionId: submission.id,
            problemId: parsedProblemId,
            language: normLang,
            status: "PENDING"
        });

        // 7. Publish job to RabbitMQ queue with correlated requestId
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

        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId) || parsedId <= 0 || !Number.isInteger(Number(id))) {
            return res.status(400).json({
                message: "Submission ID must be a positive integer",
                requestId
            });
        }

        const result = await pool.query(
            `SELECT *
             FROM submissions
             WHERE id = $1`,
            [parsedId]
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