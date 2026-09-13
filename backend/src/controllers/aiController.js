const aiService = require("../services/ai/aiService");

const MAX_PROMPT_LENGTH = 4000;

/**
 * Controller for POST /api/ai/test
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

module.exports = {
    testAICompletion
};
