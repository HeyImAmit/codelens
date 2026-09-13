const { ChatGroq } = require("@langchain/groq");

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
 * @param {string} prompt - Clean validated text prompt
 * @param {Object} [options] - Optional generation options
 * @returns {Promise<{ text: string, model: string, usage: Object|null }>}
 */
async function generateText(prompt, options = {}) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
        const configError = new Error("Groq API key is not configured");
        configError.isConfigError = true;
        configError.code = "CONFIG_ERROR";
        throw configError;
    }

    const modelName = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    const timeoutMs = parseInt(process.env.AI_REQUEST_TIMEOUT_MS, 10) || 15000;

    const chatModel = new ChatGroq({
        apiKey: apiKey,
        model: modelName,
        temperature: typeof options.temperature === "number" ? options.temperature : 0.7,
        timeout: timeoutMs,
        maxRetries: 1
    });

    const startTime = Date.now();

    try {
        console.log(`[AI Service] AI request started | provider=groq | model=${modelName}`);

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

        // Only log token usage if the provider/LangChain exposed reliable usage metadata
        const usage = response.usage_metadata || response.response_metadata?.tokenUsage || null;

        if (usage) {
            console.log(
                `[AI Service] AI provider request completed | provider=groq | model=${modelName} | latency=${latencyMs}ms | usage=${JSON.stringify(usage)}`
            );
        } else {
            console.log(
                `[AI Service] AI provider request completed | provider=groq | model=${modelName} | latency=${latencyMs}ms`
            );
        }

        return {
            text: outputText,
            model: modelName,
            usage
        };
    } catch (err) {
        const latencyMs = Date.now() - startTime;
        const classified = classifyAiError(err);

        console.error(
            `[AI Service] AI provider request failed | provider=groq | model=${modelName} | latency=${latencyMs}ms | category=${classified.category}`
        );

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
