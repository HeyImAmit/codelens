const { getRedisClient, isRedisReady } = require("../../config/redis");
const { config } = require("../../config/env");
const { logger } = require("../../utils/logger");

const CACHE_TTL_SECONDS = config.redis.cacheTtlSeconds;

const CACHE_KEYS = {
    ALL_PROBLEMS: "problems:all",
    PROBLEM_BY_ID: (id) => `problems:${id}`
};

/**
 * Get all cached problems
 */
const getCachedAllProblems = async () => {
    if (!isRedisReady()) return null;
    const client = getRedisClient();
    const key = CACHE_KEYS.ALL_PROBLEMS;

    try {
        const data = await client.get(key);
        if (data) {
            logger.debug("Problem cache HIT", { key });
            return JSON.parse(data);
        }
        logger.debug("Problem cache MISS", { key });
        return null;
    } catch (error) {
        logger.warn("Problem cache error while reading all problems", { key, error: error.message });
        return null;
    }
};

/**
 * Set all problems in cache
 */
const setCachedAllProblems = async (problems) => {
    if (!isRedisReady() || !problems) return;
    const client = getRedisClient();
    const key = CACHE_KEYS.ALL_PROBLEMS;

    try {
        await client.set(key, JSON.stringify(problems), {
            EX: CACHE_TTL_SECONDS
        });
    } catch (error) {
        logger.warn("Problem cache error while setting all problems", { key, error: error.message });
    }
};

/**
 * Get cached problem by ID
 */
const getCachedProblemById = async (id) => {
    if (!isRedisReady()) return null;
    const client = getRedisClient();
    const key = CACHE_KEYS.PROBLEM_BY_ID(id);

    try {
        const data = await client.get(key);
        if (data) {
            logger.debug("Problem cache HIT", { key, problemId: id });
            return JSON.parse(data);
        }
        logger.debug("Problem cache MISS", { key, problemId: id });
        return null;
    } catch (error) {
        logger.warn("Problem cache error while reading problem by ID", { key, problemId: id, error: error.message });
        return null;
    }
};

/**
 * Set problem by ID in cache
 */
const setCachedProblemById = async (id, problem) => {
    if (!isRedisReady() || !problem) return;
    const client = getRedisClient();
    const key = CACHE_KEYS.PROBLEM_BY_ID(id);

    try {
        await client.set(key, JSON.stringify(problem), {
            EX: CACHE_TTL_SECONDS
        });
    } catch (error) {
        logger.warn("Problem cache error while setting problem by ID", { key, problemId: id, error: error.message });
    }
};

/**
 * Invalidate problem cache keys
 */
const invalidateProblemCache = async (id) => {
    if (!isRedisReady()) return;
    const client = getRedisClient();

    try {
        const keysToDelete = [CACHE_KEYS.ALL_PROBLEMS];
        if (id) {
            keysToDelete.push(CACHE_KEYS.PROBLEM_BY_ID(id));
        }
        await client.del(keysToDelete);
        logger.info("Problem cache invalidated", { keys: keysToDelete });
    } catch (error) {
        logger.warn("Problem cache error while invalidating", { error: error.message });
    }
};

module.exports = {
    CACHE_KEYS,
    CACHE_TTL_SECONDS,
    getCachedAllProblems,
    setCachedAllProblems,
    getCachedProblemById,
    setCachedProblemById,
    invalidateProblemCache
};
