const pool = require("../config/db");
const {
    getCachedAllProblems,
    setCachedAllProblems,
    getCachedProblemById,
    setCachedProblemById
} = require("../services/cache/problemCache");

const getAllProblems = async (req, res) => {
    try {
        // 1. Check Redis Cache
        const cachedProblems = await getCachedAllProblems();
        if (cachedProblems) {
            return res.json(cachedProblems);
        }

        // 2. Fallback / Cache Miss: Query PostgreSQL
        const result = await pool.query(
            `SELECT id, title, difficulty, description
             FROM problems
             ORDER BY id`
        );

        // 3. Populate Redis Cache
        await setCachedAllProblems(result.rows);

        res.json(result.rows);

    } catch (error) {
        console.error("Failed to fetch all problems:", error);

        res.status(500).json({
            message: "Failed to fetch problems"
        });
    }
};

const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Check Redis Cache
        const cachedProblem = await getCachedProblemById(id);
        if (cachedProblem) {
            return res.json(cachedProblem);
        }

        // 2. Fallback / Cache Miss: Query PostgreSQL
        const result = await pool.query(
            `SELECT *
             FROM problems
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Problem not found"
            });
        }

        const problem = result.rows[0];

        // 3. Populate Redis Cache
        await setCachedProblemById(id, problem);

        res.json(problem);

    } catch (error) {
        console.error("Failed to fetch problem by ID:", error);

        res.status(500).json({
            message: "Failed to fetch problem"
        });
    }
};

module.exports = {
    getAllProblems,
    getProblemById
};