const { ChatGroq } = require("@langchain/groq");
const { config } = require("../../config/env");
const { logger } = require("../../utils/logger");

/**
 * Normalizes and classifies errors from LangChain / Groq SDK
 * to prevent leaking secrets, internal stacks, or provider internals.
 */
function classifyAiError(error) {
    const errorMsg = error?.message || "";
    const status = error?.status || error?.statusCode || error?.response?.status;

    if (error?.isConfigError || error?.code === "CONFIG_ERROR") {
        return {
            statusCode: 500,
            message: error.message || "AI service configuration error",
            category: "CONFIG_ERROR"
        };
    }

    if (status === 401 || /unauthorized|invalid.*api.*key|authentication/i.test(errorMsg)) {
        return {
            statusCode: 502,
            message: "AI provider authentication failed",
            category: "AUTH_ERROR"
        };
    }

    if (status === 429 || /rate.*limit|quota|too many requests/i.test(errorMsg)) {
        return {
            statusCode: 429,
            message: "AI service rate limit exceeded. Please try again later.",
            category: "RATE_LIMIT"
        };
    }

    if (
        error?.name === "TimeoutError" ||
        error?.name === "AbortError" ||
        /timeout|timed out|aborted|ETIMEDOUT|ECONNABORTED/i.test(errorMsg)
    ) {
        return {
            statusCode: 504,
            message: "AI request timed out",
            category: "TIMEOUT"
        };
    }

    if (/ENOTFOUND|ECONNREFUSED|ECONNRESET|network/i.test(errorMsg)) {
        return {
            statusCode: 502,
            message: "Failed to connect to AI provider",
            category: "NETWORK_ERROR"
        };
    }

    if (status === 400 || /bad request|invalid request/i.test(errorMsg)) {
        return {
            statusCode: 502,
            message: "AI provider rejected the request",
            category: "PROVIDER_ERROR"
        };
    }

    return {
        statusCode: 500,
        message: "An unexpected error occurred in the AI service",
        category: "INTERNAL_ERROR"
    };
}

/**
 * Generates text completion using LangChain ChatGroq.
 *
 * @param {string|Array} prompt - Clean validated text prompt or messages array
 * @param {Object} [options] - Optional generation options
 * @returns {Promise<{ text: string, model: string, usage: Object|null }>}
 */
async function generateText(prompt, options = {}) {
    const apiKey = config.ai.groqApiKey;
    if (!apiKey || apiKey.trim() === "") {
        const configError = new Error("Groq API key is not configured");
        configError.isConfigError = true;
        configError.code = "CONFIG_ERROR";
        throw configError;
    }

    const modelName = config.ai.groqModel;
    const timeoutMs = config.ai.requestTimeoutMs;

    const chatModel = new ChatGroq({
        apiKey: apiKey,
        model: modelName,
        temperature: typeof options.temperature === "number" ? options.temperature : 0.7,
        timeout: timeoutMs,
        maxRetries: 1
    });

    const startTime = Date.now();

    try {
        logger.debug("AI provider request started", {
            provider: "groq",
            model: modelName,
            requestId: options.requestId
        });

        const response = await chatModel.invoke(prompt);
        const latencyMs = Date.now() - startTime;

        let outputText = "";
        if (typeof response.content === "string") {
            outputText = response.content;
        } else if (Array.isArray(response.content)) {
            outputText = response.content
                .map((part) => (typeof part === "string" ? part : part.text || ""))
                .join("");
        } else {
            outputText = String(response.content || "");
        }

        const usage = response.usage_metadata || response.response_metadata?.tokenUsage || null;

        logger.info("AI provider request completed", {
            provider: "groq",
            model: modelName,
            latencyMs,
            tokens: usage?.total_tokens,
            requestId: options.requestId
        });

        return {
            text: outputText,
            model: modelName,
            usage
        };
    } catch (err) {
        const latencyMs = Date.now() - startTime;
        const classified = classifyAiError(err);

        logger.error("AI provider request failed", {
            provider: "groq",
            model: modelName,
            latencyMs,
            category: classified.category,
            error: classified.message,
            requestId: options.requestId
        });

        const serviceError = new Error(classified.message);
        serviceError.statusCode = classified.statusCode;
        serviceError.category = classified.category;
        throw serviceError;
    }
}

module.exports = {
    generateText,
    classifyAiError
};
