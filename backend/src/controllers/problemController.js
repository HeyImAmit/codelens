const pool = require("../config/db");

const getAllProblems = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, title, difficulty, description
             FROM problems
             ORDER BY id`
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch problems"
        });
    }
};

const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;

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

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch problem"
        });
    }
};

module.exports = {
    getAllProblems,
    getProblemById
};