const { createClient } = require("redis");
const { config } = require("./env");
const { logger } = require("../utils/logger");

const redisUrl = config.redis.url;

const redisClient = createClient({
    url: redisUrl,
    disableOfflineQueue: true,
    socket: {
        reconnectStrategy: (retries) => {
            // Exponential backoff up to 3000ms
            const delay = Math.min(retries * 100, 3000);
            return delay;
        }
    }
});

redisClient.on("error", (err) => {
    logger.warn("Redis client warning/error (fallback mode available)", {
        error: err.message || String(err)
    });
});

redisClient.on("connect", () => {
    logger.debug("Redis socket connected");
});

redisClient.on("ready", () => {
    logger.info("Redis client connected and ready");
});

redisClient.on("reconnecting", () => {
    logger.warn("Redis client reconnecting...");
});

const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
        return redisClient;
    } catch (error) {
        logger.warn("Initial Redis connection failed, running with in-memory/DB fallback", {
            error: error.message
        });
        // We do not throw here to allow graceful startup even if Redis is initially down
        return redisClient;
    }
};

const getRedisClient = () => {
    return redisClient;
};

const isRedisReady = () => {
    return Boolean(redisClient && redisClient.isReady);
};

const closeRedis = async () => {
    try {
        if (redisClient && redisClient.isOpen) {
            await redisClient.quit();
            logger.info("Redis connection closed cleanly");
        }
    } catch (err) {
        logger.error("Error closing Redis connection", { error: err.message });
    }
};

module.exports = {
    redisClient,
    connectRedis,
    getRedisClient,
    isRedisReady,
    closeRedis
};
