const aiService = require("../services/ai/aiService");
const { retrieveRelevantKnowledge } = require("../services/rag/retrievalService");
const { answerQuestion } = require("../services/rag/ragTutorService");
const { reviewCode } = require("../services/ai/codeReviewService");

const MAX_PROMPT_LENGTH = 4000;
const MAX_QUERY_LENGTH = 2000;
const MAX_SOURCE_CODE_LENGTH = 15000;

/**
 * Controller for POST /api/ai/test (Milestone 5A)
 */
const testAICompletion = async (req, res) => {
    try {
        const body = req.body;

        if (!body || typeof body !== "object") {
            return res.status(400).json({
                success: false,
                message: "Request body must be a valid JSON object"
            });
        }

        const { prompt } = body;

        if (prompt === undefined || prompt === null) {
            return res.status(400).json({
                success: false,
                message: "Prompt is required"
            });
        }

        if (typeof prompt !== "string") {
            return res.status(400).json({
                success: false,
                message: "Prompt must be a string"
            });
        }

        const trimmedPrompt = prompt.trim();
        if (trimmedPrompt.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Prompt cannot be empty or whitespace only"
            });
        }

        if (prompt.length > MAX_PROMPT_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `Prompt exceeds maximum allowed length of ${MAX_PROMPT_LENGTH} characters`
            });
        }

        const result = await aiService.generateText(trimmedPrompt);

        return res.status(200).json({
            success: true,
            response: result.text
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to generate AI completion"
        });
    }
};

/**
 * Controller for POST /api/ai/retrieve (Milestone 5B)
 */
const retrieveKnowledge = async (req, res) => {
    try {
        const body = req.body;

        if (!body || typeof body !== "object") {
            return res.status(400).json({
                success: false,
                message: "Request body must be a valid JSON object"
            });
        }

        const { query, topK } = body;

        if (query === undefined || query === null) {
            return res.status(400).json({
                success: false,
                message: "Query is required"
            });
        }

        if (typeof query !== "string") {
            return res.status(400).json({
                success: false,
                message: "Query must be a string"
            });
        }

        const trimmedQuery = query.trim();
        if (trimmedQuery.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Query cannot be empty or whitespace only"
            });
        }

        if (query.length > MAX_QUERY_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `Query exceeds maximum allowed length of ${MAX_QUERY_LENGTH} characters`
            });
        }

        let parsedTopK = 5;
        if (topK !== undefined && topK !== null) {
            if (typeof topK !== "number" || !Number.isInteger(topK)) {
                return res.status(400).json({
                    success: false,
                    message: "topK must be an integer between 1 and 10"
                });
            }
            if (topK < 1 || topK > 10) {
                return res.status(400).json({
                    success: false,
                    message: "topK must be between 1 and 10"
                });
            }
            parsedTopK = topK;
        }

        const results = await retrieveRelevantKnowledge(trimmedQuery, parsedTopK);

        return res.status(200).json({
            success: true,
            results
        });
    } catch (error) {
        console.error("[RAG Retrieval Controller Error]", error.message);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to retrieve relevant knowledge"
        });
    }
};

/**
 * Controller for POST /api/ai/ask (Milestone 5C - Grounded RAG Tutor)
 */
const askTutor = async (req, res) => {
    try {
        const body = req.body;

        if (!body || typeof body !== "object") {
            return res.status(400).json({
                success: false,
                message: "Request body must be a valid JSON object"
            });
        }

        const { query, topK } = body;

        if (query === undefined || query === null) {
            return res.status(400).json({
                success: false,
                message: "Query is required"
            });
        }

        if (typeof query !== "string") {
            return res.status(400).json({
                success: false,
                message: "Query must be a string"
            });
        }

        const trimmedQuery = query.trim();
        if (trimmedQuery.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Query cannot be empty or whitespace only"
            });
        }

        if (query.length > MAX_QUERY_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `Query exceeds maximum allowed length of ${MAX_QUERY_LENGTH} characters`
            });
        }

        let parsedTopK = 3;
        if (topK !== undefined && topK !== null) {
            if (typeof topK !== "number" || !Number.isInteger(topK)) {
                return res.status(400).json({
                    success: false,
                    message: "topK must be an integer between 1 and 10"
                });
            }
            if (topK < 1 || topK > 10) {
                return res.status(400).json({
                    success: false,
                    message: "topK must be between 1 and 10"
                });
            }
            parsedTopK = topK;
        }

        const result = await answerQuestion({
            query: trimmedQuery,
            topK: parsedTopK
        });

        return res.status(200).json({
            success: true,
            answer: result.answer,
            sources: result.sources,
            retrieval: result.retrieval,
            timing: result.timing
        });
    } catch (error) {
        console.error("[RAG Tutor Controller Error]", error.message);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to process RAG tutoring request"
        });
    }
};

/**
 * Controller for POST /api/ai/review (Milestone 5D - AI Code Review)
 */
const reviewCodeSubmission = async (req, res) => {
    try {
        const body = req.body;

        if (!body || typeof body !== "object") {
            return res.status(400).json({
                success: false,
                message: "Request body must be a valid JSON object"
            });
        }

        const { problemId, language, sourceCode } = body;

        // 1. Validate problemId
        if (problemId === undefined || problemId === null) {
            return res.status(400).json({
                success: false,
                message: "problemId is required"
            });
        }

        const numProblemId = parseInt(problemId, 10);
        if (isNaN(numProblemId) || numProblemId <= 0 || !Number.isInteger(Number(problemId))) {
            return res.status(400).json({
                success: false,
                message: "problemId must be a positive integer"
            });
        }

        // 2. Validate language
        if (!language || typeof language !== "string" || language.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "language is required and must be a non-empty string"
            });
        }

        // 3. Validate sourceCode
        if (sourceCode === undefined || sourceCode === null) {
            return res.status(400).json({
                success: false,
                message: "sourceCode is required"
            });
        }

        if (typeof sourceCode !== "string") {
            return res.status(400).json({
                success: false,
                message: "sourceCode must be a string"
            });
        }

        const trimmedCode = sourceCode.trim();
        if (trimmedCode.length === 0) {
            return res.status(400).json({
                success: false,
                message: "sourceCode cannot be empty or whitespace only"
            });
        }

        if (sourceCode.length > MAX_SOURCE_CODE_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `sourceCode exceeds maximum allowed length of ${MAX_SOURCE_CODE_LENGTH} characters`
            });
        }

        // Call the code review service
        const result = await reviewCode({
            problemId: numProblemId,
            language: language.trim(),
            sourceCode: trimmedCode
        });

        return res.status(200).json({
            success: true,
            review: result.review,
            sources: result.sources,
            timing: result.timing
        });
    } catch (error) {
        console.error("[AI Code Review Controller Error]", error.message);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to process AI code review"
        });
    }
};

module.exports = {
    testAICompletion,
    retrieveKnowledge,
    askTutor,
    reviewCodeSubmission
};
