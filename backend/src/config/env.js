require("dotenv").config();

/**
 * Centralized Configuration Module
 * Consolidates all environment variables across API and Worker services.
 */
const config = {
    // Server Configuration
    port: parseInt(process.env.PORT, 10) || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
    frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",

    // Database Configuration (Docker PostgreSQL on host port 5433 by default)
    db: {
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "codelens",
        password: process.env.DB_PASSWORD || "postgres",
        port: parseInt(process.env.DB_PORT, 10) || 5433,
        max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
        idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS, 10) || 30000,
        connectionTimeoutMillis: parseInt(process.env.DB_CONN_TIMEOUT_MS, 10) || 5000
    },

    // Redis Configuration
    redis: {
        url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || 6379}`,
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        cacheTtlSeconds: parseInt(process.env.REDIS_CACHE_TTL_SECONDS, 10) || 300,
        rateLimitWindowSeconds: parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS, 10) || 60,
        rateLimitMaxSubmissions: parseInt(process.env.RATE_LIMIT_MAX_SUBMISSIONS, 10) || 10
    },

    // RabbitMQ Configuration
    rabbitmq: {
        url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
        queueName: process.env.RABBITMQ_QUEUE || "code-execution",
        prefetchCount: parseInt(process.env.RABBITMQ_PREFETCH, 10) || 1
    },

    // Groq / LangChain AI Configuration
    ai: {
        groqApiKey: process.env.GROQ_API_KEY || "",
        groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        requestTimeoutMs: parseInt(process.env.AI_REQUEST_TIMEOUT_MS, 10) || 15000,
        maxPromptLength: parseInt(process.env.AI_MAX_PROMPT_LENGTH, 10) || 4000,
        maxQueryLength: parseInt(process.env.AI_MAX_QUERY_LENGTH, 10) || 2000,
        maxSourceCodeLength: parseInt(process.env.AI_MAX_SOURCE_CODE_LENGTH, 10) || 15000
    },

    // Execution Sandbox Settings
    execution: {
        timeoutMs: parseInt(process.env.EXECUTION_TIMEOUT_MS, 10) || 10000,
        maxOutputBytes: parseInt(process.env.EXECUTION_MAX_OUTPUT_BYTES, 10) || 65536,
        maxSourceCodeLength: parseInt(process.env.SUBMISSION_MAX_CODE_BYTES, 10) || 50000
    },

    // Logging & Observability Settings
    logging: {
        level: (process.env.LOG_LEVEL || "info").toLowerCase()
    }
};

/**
 * Validates essential configurations and returns non-fatal warnings
 * for development, or throws in production when critical secrets are absent.
 */
function validateConfig() {
    const warnings = [];

    if (!config.ai.groqApiKey) {
        warnings.push("GROQ_API_KEY is not set. AI endpoints will fail if called.");
    }

    if (config.isProduction) {
        if (!config.db.password) {
            throw new Error("Fatal: DB_PASSWORD must be configured in production.");
        }
    }

    return { isValid: true, warnings };
}

module.exports = {
    config,
    validateConfig
};
