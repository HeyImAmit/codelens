const aiService = require("../services/ai/aiService");
const { retrieveRelevantKnowledge } = require("../services/rag/retrievalService");
const { answerQuestion } = require("../services/rag/ragTutorService");

const MAX_PROMPT_LENGTH = 4000;
const MAX_QUERY_LENGTH = 2000;

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

        // Call the AI Service layer
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

module.exports = {
    testAICompletion,
    retrieveKnowledge,
    askTutor
};
