require("dotenv").config();
const pool = require("./db");

const initAndSeedTestCases = async () => {
    try {
        console.log("Creating test_cases table if not exists...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS test_cases (
                id SERIAL PRIMARY KEY,
                problem_id INTEGER NOT NULL,
                input TEXT NOT NULL,
                expected_output TEXT NOT NULL,
                is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT fk_test_case_problem
                    FOREIGN KEY (problem_id)
                    REFERENCES problems(id)
                    ON DELETE CASCADE
            );
        `);

        // Check if test cases are already seeded
        const existing = await pool.query("SELECT COUNT(*) FROM test_cases");
        if (parseInt(existing.rows[0].count, 10) > 0) {
            console.log(`test_cases table already has ${existing.rows[0].count} entries.`);
            return;
        }

        console.log("Seeding test cases for existing problems...");

        // Problem 1: Two Sum
        // Input format: First line "n target", second line "n integers"
        // Output format: "i j" (indices)
        const twoSumTestCases = [
            {
                problem_id: 1,
                input: "4 9\n2 7 11 15",
                expected_output: "0 1",
                is_hidden: false
            },
            {
                problem_id: 1,
                input: "3 6\n3 2 4",
                expected_output: "1 2",
                is_hidden: false
            },
            {
                problem_id: 1,
                input: "2 6\n3 3",
                expected_output: "0 1",
                is_hidden: true
            },
            {
                problem_id: 1,
                input: "5 10\n1 2 3 4 8",
                expected_output: "1 4",
                is_hidden: true
            }
        ];

        // Problem 2: Valid Parentheses
        // Input format: A string containing brackets
        // Output format: true or false
        const validParenthesesTestCases = [
            {
                problem_id: 2,
                input: "()",
                expected_output: "true",
                is_hidden: false
            },
            {
                problem_id: 2,
                input: "()[]{}",
                expected_output: "true",
                is_hidden: false
            },
            {
                problem_id: 2,
                input: "(]",
                expected_output: "false",
                is_hidden: false
            },
            {
                problem_id: 2,
                input: "([)]",
                expected_output: "false",
                is_hidden: true
            },
            {
                problem_id: 2,
                input: "{[]}",
                expected_output: "true",
                is_hidden: true
            },
            {
                problem_id: 2,
                input: "]",
                expected_output: "false",
                is_hidden: true
            }
        ];

        const allCases = [...twoSumTestCases, ...validParenthesesTestCases];

        for (const tc of allCases) {
            await pool.query(
                `INSERT INTO test_cases (problem_id, input, expected_output, is_hidden)
                 VALUES ($1, $2, $3, $4)`,
                [tc.problem_id, tc.input, tc.expected_output, tc.is_hidden]
            );
        }

        console.log(`Successfully seeded ${allCases.length} test cases.`);
    } catch (error) {
        console.error("Error seeding test cases:", error.message);
        throw error;
    }
};

if (require.main === module) {
    initAndSeedTestCases().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = initAndSeedTestCases;
