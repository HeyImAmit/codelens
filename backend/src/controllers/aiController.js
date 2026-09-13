const aiService = require("../services/ai/aiService");
const { retrieveRelevantKnowledge } = require("../services/rag/retrievalService");
const { answerQuestion } = require("../services/rag/ragTutorService");
const { reviewCode } = require("../services/ai/codeReviewService");
const { generateProgressiveHint } = require("../services/ai/hintService");
const { config } = require("../config/env");
const { logger } = require("../utils/logger");

const MAX_PROMPT_LENGTH = config.ai.maxPromptLength;
const MAX_QUERY_LENGTH = config.ai.maxQueryLength;
const MAX_SOURCE_CODE_LENGTH = config.ai.maxSourceCodeLength;
const MAX_PREVIOUS_HINTS = 10;
const MAX_PREVIOUS_HINT_LENGTH = 2000;

/**
 * Controller for POST /api/ai/test (Milestone 5A)
 */
const testAICompletion = async (req, res, next) => {
    const requestId = req.requestId || "unknown";

    try {
        const body = req.body;

        if (!body || typeof body !== "object") {
            return res.status(400).json({
                success: false,
                message: "Request body must be a valid JSON object",
                requestId
            });
        }

        const { prompt } = body;

        if (prompt === undefined || prompt === null) {
            return res.status(400).json({
                success: false,
                message: "Prompt is required",
                requestId
            });
        }

        if (typeof prompt !== "string") {
            return res.status(400).json({
                success: false,
                message: "Prompt must be a string",
                requestId
            });
        }

        const trimmedPrompt = prompt.trim();
        if (trimmedPrompt.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Prompt cannot be empty or whitespace only",
                requestId
            });
        }

        if (prompt.length > MAX_PROMPT_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `Prompt exceeds maximum allowed length of ${MAX_PROMPT_LENGTH} characters`,
                requestId
            });
        }

        const result = await aiService.generateText(trimmedPrompt, { requestId });

        return res.status(200).json({
            success: true,
            response: result.text,
            requestId
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        logger.error("AI Test completion error", {
            error: error.message,
            statusCode,
            requestId
        });
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to generate AI completion",
            requestId
        });
    }
};

/**
 * Controller for POST /api/ai/retrieve (Milestone 5B)
 */
const retrieveKnowledge = async (req, res, next) => {
    const requestId = req.requestId || "unknown";

    try {
        const body = req.body;

        if (!body || typeof body !== "object") {
            return res.status(400).json({
                success: false,
                message: "Request body must be a valid JSON object",
                requestId
            });
        }

        const { query, topK } = body;

        if (query === undefined || query === null) {
            return res.status(400).json({
                success: false,
                message: "Query is required",
                requestId
            });
        }

        if (typeof query !== "string") {
            return res.status(400).json({
                success: false,
                message: "Query must be a string",
                requestId
            });
        }

        const trimmedQuery = query.trim();
        if (trimmedQuery.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Query cannot be empty or whitespace only",
                requestId
            });
        }

        if (query.length > MAX_QUERY_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `Query exceeds maximum allowed length of ${MAX_QUERY_LENGTH} characters`,
                requestId
            });
        }

        let parsedTopK = 5;
        if (topK !== undefined && topK !== null) {
            if (typeof topK !== "number" || !Number.isInteger(topK)) {
                return res.status(400).json({
                    success: false,
                    message: "topK must be an integer between 1 and 10",
                    requestId
                });
            }
            if (topK < 1 || topK > 10) {
                return res.status(400).json({
                    success: false,
                    message: "topK must be between 1 and 10",
                    requestId
                });
            }
            parsedTopK = topK;
        }

        const results = await retrieveRelevantKnowledge(trimmedQuery, parsedTopK);

        logger.info("RAG knowledge retrieval completed", {
            operation: "rag_retrieve",
            queryLength: trimmedQuery.length,
            topK: parsedTopK,
            resultsCount: results.length,
            requestId
        });

        return res.status(200).json({
            success: true,
            results,
            requestId
        });
    } catch (error) {
        logger.error("RAG Retrieval Controller Error", {
            error: error.message,
            requestId
        });
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to retrieve relevant knowledge",
            requestId
        });
    }
};

/**
 * Controller for POST /api/ai/ask (Milestone 5C - Grounded RAG Tutor)
 */
const askTutor = async (req, res, next) => {
    const requestId = req.requestId || "unknown";

    try {
        const body = req.body;

        if (!body || typeof body !== "object") {
            return res.status(400).json({
                success: false,
                message: "Request body must be a valid JSON object",
                requestId
            });
        }

        const { query, topK } = body;

        if (query === undefined || query === null) {
            return res.status(400).json({
                success: false,
                message: "Query is required",
                requestId
            });
        }

        if (typeof query !== "string") {
            return res.status(400).json({
                success: false,
                message: "Query must be a string",
                requestId
            });
        }

        const trimmedQuery = query.trim();
        if (trimmedQuery.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Query cannot be empty or whitespace only",
                requestId
            });
        }

        if (query.length > MAX_QUERY_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `Query exceeds maximum allowed length of ${MAX_QUERY_LENGTH} characters`,
                requestId
            });
        }

        let parsedTopK = 3;
        if (topK !== undefined && topK !== null) {
            if (typeof topK !== "number" || !Number.isInteger(topK)) {
                return res.status(400).json({
                    success: false,
                    message: "topK must be an integer between 1 and 10",
                    requestId
                });
            }
            if (topK < 1 || topK > 10) {
                return res.status(400).json({
                    success: false,
                    message: "topK must be between 1 and 10",
                    requestId
                });
            }
            parsedTopK = topK;
        }

        const result = await answerQuestion({
            query: trimmedQuery,
            topK: parsedTopK,
            requestId
        });

        return res.status(200).json({
            success: true,
            answer: result.answer,
            sources: result.sources,
            retrieval: result.retrieval,
            timing: result.timing,
            requestId
        });
    } catch (error) {
        logger.error("RAG Tutor Controller Error", {
            error: error.message,
            requestId
        });
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to process RAG tutoring request",
            requestId
        });
    }
};

/**
 * Controller for POST /api/ai/review (Milestone 5D - AI Code Review)
 */
const reviewCodeSubmission = async (req, res, next) => {
    const requestId = req.requestId || "unknown";

    try {
        const body = req.body;

        if (!body || typeof body !== "object") {
            return res.status(400).json({
                success: false,
                message: "Request body must be a valid JSON object",
                requestId
            });
        }

        const { problemId, language, sourceCode } = body;

        // 1. Validate problemId
        if (problemId === undefined || problemId === null) {
            return res.status(400).json({
                success: false,
                message: "problemId is required",
                requestId
            });
        }

        const numProblemId = parseInt(problemId, 10);
        if (isNaN(numProblemId) || numProblemId <= 0 || !Number.isInteger(Number(problemId))) {
            return res.status(400).json({
                success: false,
                message: "problemId must be a positive integer",
                requestId
            });
        }

        // 2. Validate language
        if (!language || typeof language !== "string" || language.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "language is required and must be a non-empty string",
                requestId
            });
        }

        // 3. Validate sourceCode
        if (sourceCode === undefined || sourceCode === null) {
            return res.status(400).json({
                success: false,
                message: "sourceCode is required",
                requestId
            });
        }

        if (typeof sourceCode !== "string") {
            return res.status(400).json({
                success: false,
                message: "sourceCode must be a string",
                requestId
            });
        }

        const trimmedCode = sourceCode.trim();
        if (trimmedCode.length === 0) {
            return res.status(400).json({
                success: false,
                message: "sourceCode cannot be empty or whitespace only",
                requestId
            });
        }

        if (sourceCode.length > MAX_SOURCE_CODE_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `sourceCode exceeds maximum allowed length of ${MAX_SOURCE_CODE_LENGTH} characters`,
                requestId
            });
        }

        const result = await reviewCode({
            problemId: numProblemId,
            language: language.trim(),
            sourceCode: trimmedCode,
            requestId
        });

        return res.status(200).json({
            success: true,
            review: result.review,
            sources: result.sources,
            timing: result.timing,
            requestId
        });
    } catch (error) {
        logger.error("AI Code Review Controller Error", {
            error: error.message,
            requestId
        });
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to process AI code review",
            requestId
        });
    }
};

/**
 * Controller for POST /api/ai/hint (Milestone 5E - Progressive Hints)
 */
const getProgressiveHint = async (req, res, next) => {
    const requestId = req.requestId || "unknown";

    try {
        const body = req.body;

        if (!body || typeof body !== "object") {
            return res.status(400).json({
                success: false,
                message: "Request body must be a valid JSON object",
                requestId
            });
        }

        const { problemId, level, sourceCode, previousHints } = body;

        // 1. Validate problemId
        if (problemId === undefined || problemId === null) {
            return res.status(400).json({
                success: false,
                message: "problemId is required",
                requestId
            });
        }

        const numProblemId = parseInt(problemId, 10);
        if (isNaN(numProblemId) || numProblemId <= 0 || !Number.isInteger(Number(problemId))) {
            return res.status(400).json({
                success: false,
                message: "problemId must be a positive integer",
                requestId
            });
        }

        // 2. Validate level (1-4)
        if (level === undefined || level === null) {
            return res.status(400).json({
                success: false,
                message: "level is required",
                requestId
            });
        }

        const numLevel = parseInt(level, 10);
        if (isNaN(numLevel) || numLevel < 1 || numLevel > 4 || !Number.isInteger(Number(level))) {
            return res.status(400).json({
                success: false,
                message: "level must be an integer between 1 and 4",
                requestId
            });
        }

        // 3. Validate optional sourceCode
        let cleanSourceCode = null;
        if (sourceCode !== undefined && sourceCode !== null) {
            if (typeof sourceCode !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "sourceCode must be a string",
                    requestId
                });
            }
            if (sourceCode.length > MAX_SOURCE_CODE_LENGTH) {
                return res.status(400).json({
                    success: false,
                    message: `sourceCode exceeds maximum allowed length of ${MAX_SOURCE_CODE_LENGTH} characters`,
                    requestId
                });
            }
            cleanSourceCode = sourceCode;
        }

        // 4. Validate optional previousHints
        let cleanPreviousHints = [];
        if (previousHints !== undefined && previousHints !== null) {
            if (!Array.isArray(previousHints)) {
                return res.status(400).json({
                    success: false,
                    message: "previousHints must be an array of strings",
                    requestId
                });
            }
            if (previousHints.length > MAX_PREVIOUS_HINTS) {
                return res.status(400).json({
                    success: false,
                    message: `previousHints array cannot contain more than ${MAX_PREVIOUS_HINTS} entries`,
                    requestId
                });
            }
            for (const h of previousHints) {
                if (typeof h !== "string") {
                    return res.status(400).json({
                        success: false,
                        message: "Each element in previousHints must be a string",
                        requestId
                    });
                }
                if (h.length > MAX_PREVIOUS_HINT_LENGTH) {
                    return res.status(400).json({
                        success: false,
                        message: `Each previous hint cannot exceed ${MAX_PREVIOUS_HINT_LENGTH} characters`,
                        requestId
                    });
                }
            }
            cleanPreviousHints = previousHints;
        }

        const result = await generateProgressiveHint({
            problemId: numProblemId,
            level: numLevel,
            sourceCode: cleanSourceCode,
            previousHints: cleanPreviousHints,
            requestId
        });

        return res.status(200).json({
            ...result,
            requestId
        });
    } catch (error) {
        logger.error("Progressive AI Hint Controller Error", {
            error: error.message,
            requestId
        });
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to generate progressive hint",
            requestId
        });
    }
};

module.exports = {
    testAICompletion,
    retrieveKnowledge,
    askTutor,
    reviewCodeSubmission,
    getProgressiveHint,
    generateHint: getProgressiveHint,
    MAX_PROMPT_LENGTH,
    MAX_QUERY_LENGTH,
    MAX_SOURCE_CODE_LENGTH,
    MAX_PREVIOUS_HINTS,
    MAX_PREVIOUS_HINT_LENGTH
};
