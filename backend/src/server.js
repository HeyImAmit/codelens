const express = require("express");
const cors = require("cors");
const { config, validateConfig } = require("./config/env");
const { logger } = require("./utils/logger");
const { requestIdMiddleware } = require("./middleware/requestId");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const pool = require("./config/db");
const { connectRedis, closeRedis } = require("./config/redis");
const { connectRabbitMQ, closeRabbitMQ } = require("./config/rabbitmq");

const problemRoutes = require("./routes/problemRoute");
const submissionRoutes = require("./routes/submissionRoutes");
const aiRoutes = require("./routes/aiRoutes");
const healthRoutes = require("./routes/healthRoutes");

const app = express();

// 1. Global Middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(requestIdMiddleware);

// 2. Base & Health Endpoints
app.use("/health", healthRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "CodeLens API is running",
        version: "1.0.0",
        requestId: req.requestId
    });
});

// 3. API Feature Routes
app.use("/api/problems", problemRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/ai", aiRoutes);

// 4. 404 and Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

let server = null;
let isShuttingDown = false;

const startServer = async () => {
    const { warnings } = validateConfig();
    warnings.forEach((warn) => logger.warn(warn));

    try {
        // Initialize Redis connection
        await connectRedis();

        // Initialize RabbitMQ connection
        await connectRabbitMQ();

        // Start Express HTTP Server
        server = app.listen(config.port, () => {
            logger.info(`CodeLens API server running on port ${config.port}`, {
                port: config.port,
                env: config.nodeEnv,
                dbPort: config.db.port
            });
        });
    } catch (error) {
        logger.error("Failed to complete full server initialization", {
            error: error.message
        });

        // Fallback startup with graceful service warnings
        server = app.listen(config.port, () => {
            logger.warn(`CodeLens API running in degraded mode on port ${config.port}`, {
                port: config.port,
                env: config.nodeEnv
            });
        });
    }
};

/**
 * Graceful API Server Shutdown Handler
 */
const handleShutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`Received ${signal}. Initiating graceful shutdown...`);

    const shutdownTimeout = setTimeout(() => {
        logger.error("Graceful shutdown timed out after 10s. Forcing exit.");
        process.exit(1);
    }, 10000);
    shutdownTimeout.unref();

    try {
        // 1. Stop accepting new HTTP requests
        if (server) {
            await new Promise((resolve) => server.close(resolve));
            logger.info("HTTP server closed.");
        }

        // 2. Close RabbitMQ resources
        await closeRabbitMQ();

        // 3. Close Redis connection
        await closeRedis();

        // 4. Close PostgreSQL pool
        await pool.end();
        logger.info("PostgreSQL pool drained.");

        logger.info("Graceful shutdown completed successfully. Exiting.");
        process.exit(0);
    } catch (err) {
        logger.error("Error during graceful shutdown", { error: err.message });
        process.exit(1);
    }
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

startServer();

module.exports = { app, startServer, handleShutdown };