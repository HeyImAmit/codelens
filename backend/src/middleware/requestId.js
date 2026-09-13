const crypto = require("crypto");
const { logger } = require("../utils/logger");

const VALID_REQUEST_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

/**
 * Request Correlation ID & HTTP Access Logging Middleware
 * Ensures every incoming HTTP request carries a unique, safe correlation ID.
 */
function requestIdMiddleware(req, res, next) {
    const rawHeader = req.headers["x-request-id"] || req.headers["x-correlation-id"];
    let requestId;

    if (typeof rawHeader === "string" && VALID_REQUEST_ID_REGEX.test(rawHeader.trim())) {
        requestId = rawHeader.trim();
    } else {
        requestId = crypto.randomUUID();
    }

    req.requestId = requestId;
    req.id = requestId;
    res.setHeader("X-Request-ID", requestId);

    // Create a request-scoped logger for downstream handlers
    req.logger = logger.child({ requestId });

    const startTime = Date.now();

    // Log incoming request
    req.logger.info("HTTP request received", {
        method: req.method,
        path: req.originalUrl || req.url,
        ip: req.ip || req.socket?.remoteAddress || "unknown"
    });

    // Capture response completion
    res.on("finish", () => {
        const durationMs = Date.now() - startTime;
        const statusCode = res.statusCode;
        const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";

        req.logger[level]("HTTP request completed", {
            method: req.method,
            path: req.originalUrl || req.url,
            statusCode,
            durationMs
        });
    });

    next();
}

module.exports = {
    requestIdMiddleware
};
