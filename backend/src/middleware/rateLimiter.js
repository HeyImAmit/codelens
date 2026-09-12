const { getRedisClient, isRedisReady } = require("../config/redis");

const SUBMISSION_LIMIT = 10;
const WINDOW_DURATION_SECONDS = 60;

/**
 * Redis-backed fixed-window rate limiter for submissions
 * Policy: 10 submissions per minute per client IP.
 * Fail-Open: If Redis is unavailable, requests are allowed through with a log.
 */
const submissionRateLimiter = async (req, res, next) => {
    // Check if Redis client is available and connected
    if (!isRedisReady()) {
        console.warn("Rate limiter unavailable; allowing request.");
        return next();
    }

    try {
        const client = getRedisClient();

        // Determine client identity (IP address)
        const clientIp = req.ip || req.socket?.remoteAddress || "127.0.0.1";

        // Current fixed 1-minute window bucket
        const currentTimestampSec = Math.floor(Date.now() / 1000);
        const windowBucket = Math.floor(currentTimestampSec / WINDOW_DURATION_SECONDS);

        const rateLimitKey = `rate_limit:submission:${clientIp}:${windowBucket}`;

        // Atomically increment counter and set 60s TTL if key was newly created (using NX flag)
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

            return res.status(429).json({
                error: "Too many submissions. Please try again later."
            });
        }

        next();
    } catch (error) {
        console.error("Rate limiter error; allowing request (fail-open):", error.message);
        next();
    }
};

module.exports = {
    submissionRateLimiter,
    SUBMISSION_LIMIT,
    WINDOW_DURATION_SECONDS
};
