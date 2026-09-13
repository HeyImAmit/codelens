/**
 * Lightweight Centralized Structured JSON Logger for CodeLens
 * Outputs newline-delimited JSON logs with contextual metadata and sanitization.
 */

const LOG_LEVELS = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40
};

// Sensitive field keys that must NEVER be logged or leaked
const SENSITIVE_KEYS = new Set([
    "password",
    "db_password",
    "dbpassword",
    "apikey",
    "api_key",
    "groqapikey",
    "groq_api_key",
    "authorization",
    "cookie",
    "secret",
    "token",
    "sourcecode",
    "source_code",
    "prompt",
    "systemprompt",
    "userprompt",
    "rawprompt",
    "hiddentestcases",
    "testcases",
    "test_cases"
]);

/**
 * Sanitizes context objects to prevent secret leaks, source code dumps,
 * and circular reference serialization errors.
 */
function sanitizeMeta(value, depth = 0) {
    if (depth > 4) return "[Max Depth Reached]";
    if (value === null || value === undefined) return value;

    if (value instanceof Error) {
        return {
            name: value.name,
            message: value.message,
            code: value.code,
            statusCode: value.statusCode || value.status
        };
    }

    if (Array.isArray(value)) {
        return value.slice(0, 20).map((item) => sanitizeMeta(item, depth + 1));
    }

    if (typeof value === "object") {
        const sanitized = {};
        for (const [k, v] of Object.entries(value)) {
            const lowerKey = k.toLowerCase().replace(/[-_]/g, "");
            if (SENSITIVE_KEYS.has(lowerKey)) {
                sanitized[k] = "[REDACTED]";
            } else if (typeof v === "string" && v.length > 500) {
                // Truncate overly long metadata strings to avoid log bloat
                sanitized[k] = `${v.substring(0, 500)}... [truncated]`;
            } else {
                sanitized[k] = sanitizeMeta(v, depth + 1);
            }
        }
        return sanitized;
    }

    return value;
}

class Logger {
    constructor(defaultContext = {}) {
        this.defaultContext = {
            service: "api",
            ...defaultContext
        };
        const envLevel = (process.env.LOG_LEVEL || "info").toLowerCase();
        this.currentLevelValue = LOG_LEVELS[envLevel] || LOG_LEVELS.info;
    }

    child(context = {}) {
        return new Logger({
            ...this.defaultContext,
            ...context
        });
    }

    _log(level, message, meta = {}) {
        const levelVal = LOG_LEVELS[level] || LOG_LEVELS.info;
        if (levelVal < this.currentLevelValue) {
            return;
        }

        let metaObj = {};
        if (meta instanceof Error) {
            metaObj = { error: sanitizeMeta(meta) };
        } else if (typeof meta === "object" && meta !== null) {
            metaObj = sanitizeMeta(meta);
        } else if (meta !== undefined) {
            metaObj = { extra: sanitizeMeta(meta) };
        }

        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message: typeof message === "string" ? message : String(message),
            ...this.defaultContext,
            ...metaObj
        };

        const jsonString = JSON.stringify(logEntry);

        if (level === "error") {
            process.stderr.write(jsonString + "\n");
        } else {
            process.stdout.write(jsonString + "\n");
        }
    }

    info(message, meta) {
        this._log("info", message, meta);
    }

    warn(message, meta) {
        this._log("warn", message, meta);
    }

    error(message, meta) {
        this._log("error", message, meta);
    }

    debug(message, meta) {
        this._log("debug", message, meta);
    }
}

const defaultLogger = new Logger({ service: "api" });

module.exports = {
    logger: defaultLogger,
    Logger,
    sanitizeMeta
};
