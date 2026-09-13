const pool = require("../config/db");
const {
    getCachedAllProblems,
    setCachedAllProblems,
    getCachedProblemById,
    setCachedProblemById
} = require("../services/cache/problemCache");

const getAllProblems = async (req, res, next) => {
    const requestId = req.requestId || "unknown";
    const reqLogger = req.logger;

    try {
        // 1. Check Redis Cache
        const cachedProblems = await getCachedAllProblems();
        if (cachedProblems) {
            reqLogger.debug("Serving all problems from Redis cache", { count: cachedProblems.length });
            return res.json(cachedProblems);
        }

        // 2. Fallback / Cache Miss: Query PostgreSQL
        reqLogger.debug("Querying all problems from PostgreSQL");
        const result = await pool.query(
            `SELECT id, title, difficulty, description, topic, expected_time_complexity, expected_space_complexity
             FROM problems
             ORDER BY id`
        );

        // 3. Populate Redis Cache
        await setCachedAllProblems(result.rows);

        res.json(result.rows);

    } catch (error) {
        next(error);
    }
};

const getProblemById = async (req, res, next) => {
    const requestId = req.requestId || "unknown";
    const reqLogger = req.logger;

    try {
        const { id } = req.params;

        // 1. Check Redis Cache
        const cachedProblem = await getCachedProblemById(id);
        if (cachedProblem) {
            reqLogger.debug("Serving problem from Redis cache", { problemId: id });
            return res.json(cachedProblem);
        }

        // 2. Fallback / Cache Miss: Query PostgreSQL
        reqLogger.debug("Querying problem from PostgreSQL", { problemId: id });
        const result = await pool.query(
            `SELECT *
             FROM problems
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Problem not found",
                requestId
            });
        }

        const problem = result.rows[0];

        // 3. Populate Redis Cache
        await setCachedProblemById(id, problem);

        res.json(problem);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllProblems,
    getProblemById
};