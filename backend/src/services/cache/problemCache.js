const { getRedisClient, isRedisReady } = require("../../config/redis");

const CACHE_TTL_SECONDS = 300; // 5 minutes TTL

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
            console.log(`Problem cache HIT: ${key}`);
            return JSON.parse(data);
        }
        console.log(`Problem cache MISS: ${key}`);
        return null;
    } catch (error) {
        console.error(`Problem cache error while reading ${key}:`, error.message);
        return null;
    }
};

/**
 * Set all problems in cache with 300s TTL
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
        console.error(`Problem cache error while setting ${key}:`, error.message);
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
            console.log(`Problem cache HIT: ${key}`);
            return JSON.parse(data);
        }
        console.log(`Problem cache MISS: ${key}`);
        return null;
    } catch (error) {
        console.error(`Problem cache error while reading ${key}:`, error.message);
        return null;
    }
};

/**
 * Set problem by ID in cache with 300s TTL
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
        console.error(`Problem cache error while setting ${key}:`, error.message);
    }
};

/**
 * Invalidate problem cache keys (for future mutations)
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
        console.log(`Problem cache invalidated for: ${keysToDelete.join(", ")}`);
    } catch (error) {
        console.error("Problem cache error while invalidating:", error.message);
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
