const aiService = require("../services/ai/aiService");
const { retrieveRelevantKnowledge } = require("../services/rag/retrievalService");
const { answerQuestion } = require("../services/rag/ragTutorService");
const { reviewCode } = require("../services/ai/codeReviewService");
const { generateProgressiveHint } = require("../services/ai/hintService");

const MAX_PROMPT_LENGTH = 4000;
const MAX_QUERY_LENGTH = 2000;
const MAX_SOURCE_CODE_LENGTH = 15000;
const MAX_PREVIOUS_HINTS = 10;
const MAX_PREVIOUS_HINT_LENGTH = 2000;

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

/**
 * Controller for POST /api/ai/hint (Milestone 5E)
 */
const generateHint = async (req, res) => {
    try {
        const body = req.body;

        if (!body || typeof body !== "object") {
            return res.status(400).json({
                success: false,
                message: "Request body must be a valid JSON object"
            });
        }

        const { problemId, level, sourceCode, previousHints } = body;

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

        // 2. Validate level (must be integer 1, 2, 3, or 4)
        if (level === undefined || level === null) {
            return res.status(400).json({
                success: false,
                message: "level is required"
            });
        }

        const numLevel = parseInt(level, 10);
        if (isNaN(numLevel) || !Number.isInteger(Number(level)) || numLevel < 1 || numLevel > 4) {
            return res.status(400).json({
                success: false,
                message: "level must be an integer between 1 and 4"
            });
        }

        // 3. Validate sourceCode (optional)
        let cleanSourceCode = null;
        if (sourceCode !== undefined && sourceCode !== null) {
            if (typeof sourceCode !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "sourceCode must be a string"
                });
            }
            if (sourceCode.length > MAX_SOURCE_CODE_LENGTH) {
                return res.status(400).json({
                    success: false,
                    message: `sourceCode exceeds maximum allowed length of ${MAX_SOURCE_CODE_LENGTH} characters`
                });
            }
            cleanSourceCode = sourceCode.trim().length > 0 ? sourceCode.trim() : null;
        }

        // 4. Validate previousHints (optional)
        let cleanPreviousHints = [];
        if (previousHints !== undefined && previousHints !== null) {
            if (!Array.isArray(previousHints)) {
                return res.status(400).json({
                    success: false,
                    message: "previousHints must be an array of strings"
                });
            }
            if (previousHints.length > MAX_PREVIOUS_HINTS) {
                return res.status(400).json({
                    success: false,
                    message: `previousHints exceeds maximum allowed length of ${MAX_PREVIOUS_HINTS} items`
                });
            }
            for (let i = 0; i < previousHints.length; i++) {
                const hintItem = previousHints[i];
                if (typeof hintItem !== "string") {
                    return res.status(400).json({
                        success: false,
                        message: `previousHints at index ${i} must be a string`
                    });
                }
                if (hintItem.length > MAX_PREVIOUS_HINT_LENGTH) {
                    return res.status(400).json({
                        success: false,
                        message: `previousHints at index ${i} exceeds maximum allowed length of ${MAX_PREVIOUS_HINT_LENGTH} characters`
                    });
                }
                if (hintItem.trim().length > 0) {
                    cleanPreviousHints.push(hintItem.trim());
                }
            }
        }

        // 5. Call hint generation service
        const result = await generateProgressiveHint({
            problemId: numProblemId,
            level: numLevel,
            sourceCode: cleanSourceCode,
            previousHints: cleanPreviousHints
        });

        return res.status(200).json({
            success: true,
            hint: result.hint,
            sources: result.sources,
            timing: result.timing
        });
    } catch (error) {
        console.error("[AI Hint Controller Error]", error.message);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to generate AI hint"
        });
    }
};

module.exports = {
    testAICompletion,
    retrieveKnowledge,
    askTutor,
    reviewCodeSubmission,
    generateHint
};
