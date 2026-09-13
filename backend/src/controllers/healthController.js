const pool = require("../config/db");
const { getRedisClient, isRedisReady } = require("../config/redis");
const { getChannel, isRabbitMQConnected, getQueueInfo } = require("../config/rabbitmq");
const { config } = require("../config/env");

/**
 * Liveness probe - determines if API process is running
 */
const getLiveness = (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "api",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime())
    });
};

/**
 * Readiness probe - probes actual state of PostgreSQL, Redis, and RabbitMQ
 */
const getReadiness = async (req, res) => {
    const dependencies = {
        postgres: { status: "unknown" },
        redis: { status: "unknown" },
        rabbitmq: { status: "unknown" }
    };
    const workers = {
        status: "unknown",
        activeConsumers: 0
    };

    let isDegraded = false;
    let isUnhealthy = false;

    // 1. Check PostgreSQL
    const pgStart = Date.now();
    try {
        await pool.query("SELECT 1");
        dependencies.postgres = {
            status: "ok",
            latencyMs: Date.now() - pgStart
        };
    } catch (err) {
        isUnhealthy = true;
        dependencies.postgres = {
            status: "down",
            error: err.message
        };
    }

    // 2. Check Redis
    const redisStart = Date.now();
    try {
        if (isRedisReady()) {
            const client = getRedisClient();
            await client.ping();
            dependencies.redis = {
                status: "ok",
                latencyMs: Date.now() - redisStart
            };
        } else {
            isDegraded = true;
            dependencies.redis = {
                status: "down",
                message: "Redis is not connected (graceful fallback active)"
            };
        }
    } catch (err) {
        isDegraded = true;
        dependencies.redis = {
            status: "down",
            error: err.message
        };
    }

    // 3. Check RabbitMQ & Worker Consumers
    const rmqStart = Date.now();
    try {
        const queueName = config.rabbitmq.queueName;
        const queueInfo = await getQueueInfo(queueName);

        if (queueInfo) {
            dependencies.rabbitmq = {
                status: "ok",
                latencyMs: Date.now() - rmqStart,
                queue: queueName,
                messagesPending: queueInfo.messageCount,
                activeConsumers: queueInfo.consumerCount
            };

            workers.activeConsumers = queueInfo.consumerCount;
            if (queueInfo.consumerCount > 0) {
                workers.status = "ready";
            } else {
                workers.status = "no_active_workers";
                isDegraded = true;
            }
        } else {
            isDegraded = true;
            dependencies.rabbitmq = {
                status: "degraded",
                message: "RabbitMQ connected but queue info unavailable"
            };
            workers.status = "unknown";
        }
    } catch (err) {
        isUnhealthy = true;
        dependencies.rabbitmq = {
            status: "down",
            error: err.message
        };
        workers.status = "unavailable";
    }

    const overallStatus = isUnhealthy ? "unhealthy" : isDegraded ? "degraded" : "ok";
    const httpStatus = isUnhealthy ? 503 : 200;

    res.status(httpStatus).json({
        status: overallStatus,
        service: "api",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        dependencies,
        workers
    });
};

/**
 * General /health endpoint returning summarized status
 */
const getHealth = (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "api",
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    getLiveness,
    getReadiness,
    getHealth
};
