const pool = require("../config/db");

/**
 * Retrieves all test cases for a specific problem ID
 * @param {number} problemId - Problem ID
 * @returns {Promise<Array<{ id: number, problem_id: number, input: string, expected_output: string, is_hidden: boolean }>>}
 */
const getTestCasesByProblemId = async (problemId) => {
    try {
        const result = await pool.query(
            `SELECT id, problem_id, input, expected_output, is_hidden
             FROM test_cases
             WHERE problem_id = $1
             ORDER BY id ASC`,
            [problemId]
        );

        return result.rows;
    } catch (error) {
        console.error(`Error querying test cases for problem ${problemId}:`, error.message);
        throw error;
    }
};

module.exports = {
    getTestCasesByProblemId
};
