const { getRedisClient, isRedisReady } = require("../config/redis");
const { config } = require("../config/env");
const { logger } = require("../utils/logger");

const SUBMISSION_LIMIT = config.redis.rateLimitMaxSubmissions;
const WINDOW_DURATION_SECONDS = config.redis.rateLimitWindowSeconds;

/**
 * Redis-backed fixed-window rate limiter for submissions
 * Policy: 10 submissions per minute per client IP.
 * Fail-Open: If Redis is unavailable, requests are allowed through with a log.
 */
const submissionRateLimiter = async (req, res, next) => {
    const requestId = req.requestId || "unknown";

    // Check if Redis client is available and connected
    if (!isRedisReady()) {
        logger.warn("Rate limiter unavailable (Redis down); allowing request (fail-open)", {
            requestId,
            ip: req.ip
        });
        return next();
    }

    try {
        const client = getRedisClient();

        // Determine client identity (IP address)
        const clientIp = req.ip || req.socket?.remoteAddress || "127.0.0.1";

        // Current fixed window bucket
        const currentTimestampSec = Math.floor(Date.now() / 1000);
        const windowBucket = Math.floor(currentTimestampSec / WINDOW_DURATION_SECONDS);

        const rateLimitKey = `rate_limit:submission:${clientIp}:${windowBucket}`;

        // Atomically increment counter and set TTL if key was newly created (using NX flag)
        const multi = client.multi();
        multi.incr(rateLimitKey);
        multi.expire(rateLimitKey, WINDOW_DURATION_SECONDS, "NX");
        const results = await multi.exec();

        const count = results[0];

        // Set standard rate limit headers
        res.setHeader("X-RateLimit-Limit", SUBMISSION_LIMIT);
        res.setHeader("X-RateLimit-Remaining", Math.max(0, SUBMISSION_LIMIT - count));

        // Check if rate limit exceeded
        if (count > SUBMISSION_LIMIT) {
            const secondsRemainingInWindow = WINDOW_DURATION_SECONDS - (currentTimestampSec % WINDOW_DURATION_SECONDS);
            res.setHeader("Retry-After", secondsRemainingInWindow);

            logger.warn("Submission rate limit exceeded", {
                requestId,
                clientIp,
                count,
                limit: SUBMISSION_LIMIT
            });

            return res.status(429).json({
                error: "Too many submissions. Please try again later.",
                requestId
            });
        }

        next();
    } catch (error) {
        logger.warn("Rate limiter error; allowing request (fail-open)", {
            requestId,
            error: error.message
        });
        next();
    }
};

module.exports = {
    submissionRateLimiter,
    SUBMISSION_LIMIT,
    WINDOW_DURATION_SECONDS
};
