const pool = require("../config/db");

const createSubmission = async (req, res) => {
    try {
        const {
            problemId,
            language,
            sourceCode
        } = req.body;

        if (!problemId || !language || !sourceCode) {
            return res.status(400).json({
                message: "problemId, language and sourceCode are required"
            });
        }

        // Check whether problem exists
        const problem = await pool.query(
            `SELECT id FROM problems WHERE id = $1`,
            [problemId]
        );

        if (problem.rows.length === 0) {
            return res.status(404).json({
                message: "Problem not found"
            });
        }

        // Create submission
        const result = await pool.query(
            `INSERT INTO submissions
                (problem_id, language, source_code, status)
             VALUES
                ($1, $2, $3, 'PENDING')
             RETURNING *`,
            [problemId, language, sourceCode]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create submission"
        });
    }
};


const getSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT *
             FROM submissions
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Submission not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch submission"
        });
    }
};


module.exports = {
    createSubmission,
    getSubmissionById
};