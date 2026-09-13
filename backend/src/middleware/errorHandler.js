const { logger } = require("../utils/logger");

/**
 * Centralized Express Error Handling Middleware
 * Prevents stack trace leakage, maps status codes, and logs structured errors.
 */
function errorHandler(err, req, res, next) {
    const requestId = req.requestId || req.headers?.["x-request-id"] || "unknown";
    const reqLogger = req.logger || logger.child({ requestId });

    // Determine status code
    let statusCode = err.statusCode || err.status || 500;
    if (statusCode < 400 || statusCode > 599) {
        statusCode = 500;
    }

    // Determine safe client-facing message
    let clientMessage = err.message || "Internal server error";

    if (statusCode === 500) {
        // Prevent leaking internal db / engine error strings for unhandled 500 errors
        if (!err.isOperational && !err.isPublic) {
            clientMessage = "An unexpected error occurred. Please try again later.";
        }
    }

    // Log the error internally with full details and request context
    reqLogger.error("Unhandled error in request pipeline", {
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode,
        errorName: err.name,
        errorMessage: err.message,
        category: err.category || "GENERAL_ERROR"
    });

    // Send safe JSON response
    res.status(statusCode).json({
        message: clientMessage,
        requestId
    });
}

/**
 * 404 Fallback Middleware for unmatched routes
 */
function notFoundHandler(req, res) {
    const requestId = req.requestId || "unknown";
    const reqLogger = req.logger || logger.child({ requestId });

    reqLogger.warn("Route not found", {
        method: req.method,
        path: req.originalUrl || req.url
    });

    res.status(404).json({
        message: `Route ${req.method} ${req.originalUrl || req.url} not found`,
        requestId
    });
}

module.exports = {
    errorHandler,
    notFoundHandler
};
