const { createClient } = require("redis");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = createClient({
    url: redisUrl,
    disableOfflineQueue: true,
    socket: {
        reconnectStrategy: (retries) => {
            // Reconnect with exponential backoff up to 3000ms
            const delay = Math.min(retries * 100, 3000);
            return delay;
        }
    }
});

redisClient.on("error", (err) => {
    // Log unexpected errors without crashing Express
    console.error("Redis Client Error:", err.message || err);
});

redisClient.on("connect", () => {
    // Socket connected
});

redisClient.on("ready", () => {
    // Ready to execute commands
});

redisClient.on("reconnecting", () => {
    // Reconnecting to Redis
});

let isConnected = false;

const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            isConnected = true;
            console.log("Connected to Redis");
        }
        return redisClient;
    } catch (error) {
        console.error("Failed to connect to Redis:", error.message);
        throw error;
    }
};

const getRedisClient = () => {
    return redisClient;
};

const isRedisReady = () => {
    return Boolean(redisClient && redisClient.isReady);
};

module.exports = {
    redisClient,
    connectRedis,
    getRedisClient,
    isRedisReady
};
