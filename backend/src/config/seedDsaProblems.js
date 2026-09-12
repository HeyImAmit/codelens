require("dotenv").config();
const pool = require("./db");
const { connectRedis, getRedisClient, isRedisReady } = require("./redis");
const dsaDataset = require("./dsaDataset");

async function seedDsaProblems() {
    console.log("=== Starting CodeLens DSA Dataset & Test Case Seeding ===");
    const client = await pool.connect();

    // Attempt Redis connection for cache invalidation (fail-safe)
    let redis = null;
    try {
        await connectRedis();
        redis = getRedisClient();
    } catch (err) {
        console.warn("⚠️  Redis not connected; cache invalidation will be skipped:", err.message);
    }

    try {
        await client.query("BEGIN");
        console.log("Transaction started.");

        // 1. Safe Schema Migration (if columns don't exist)
        await client.query(`
            ALTER TABLE problems ADD COLUMN IF NOT EXISTS topic VARCHAR(50);
            ALTER TABLE problems ADD COLUMN IF NOT EXISTS expected_time_complexity VARCHAR(50);
            ALTER TABLE problems ADD COLUMN IF NOT EXISTS expected_space_complexity VARCHAR(50);
        `);
        console.log("Schema verified: topic, expected_time_complexity, and expected_space_complexity columns ready.");

        let insertedProblems = 0;
        let updatedProblems = 0;
        let insertedTestCases = 0;
        let existingTestCases = 0;
        const problemIds = [];

        for (const problem of dsaDataset) {
            // Check if problem already exists by title
            const existingRes = await client.query(
                "SELECT id FROM problems WHERE title = $1",
                [problem.title]
            );

            const inputFormat = problem.input_format || problem.inputFormat;
            const outputFormat = problem.output_format || problem.outputFormat;
            const timeComp = problem.expected_time_complexity || problem.expectedTimeComplexity;
            const spaceComp = problem.expected_space_complexity || problem.expectedSpaceComplexity;

            let problemId;
            if (existingRes.rows.length > 0) {
                problemId = existingRes.rows[0].id;
                await client.query(
                    `UPDATE problems 
                     SET description = $1, difficulty = $2, constraints = $3, 
                         input_format = $4, output_format = $5, topic = $6, 
                         expected_time_complexity = $7, expected_space_complexity = $8 
                     WHERE id = $9`,
                    [
                        problem.description,
                        problem.difficulty,
                        problem.constraints,
                        inputFormat,
                        outputFormat,
                        problem.topic,
                        timeComp,
                        spaceComp,
                        problemId
                    ]
                );
                updatedProblems++;
            } else {
                const insertRes = await client.query(
                    `INSERT INTO problems 
                     (title, description, difficulty, constraints, input_format, output_format, topic, expected_time_complexity, expected_space_complexity) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                     RETURNING id`,
                    [
                        problem.title,
                        problem.description,
                        problem.difficulty,
                        problem.constraints,
                        inputFormat,
                        outputFormat,
                        problem.topic,
                        timeComp,
                        spaceComp
                    ]
                );
                problemId = insertRes.rows[0].id;
                insertedProblems++;
            }

            problemIds.push(problemId);

            // Seed test cases for this problem
            for (const tc of problem.testCases) {
                const existingTcRes = await client.query(
                    `SELECT id FROM test_cases 
                     WHERE problem_id = $1 AND input = $2 AND expected_output = $3 AND is_hidden = $4`,
                    [problemId, tc.input, tc.expectedOutput, tc.isHidden]
                );

                if (existingTcRes.rows.length === 0) {
                    await client.query(
                        `INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) 
                         VALUES ($1, $2, $3, $4)`,
                        [problemId, tc.input, tc.expectedOutput, tc.isHidden]
                    );
                    insertedTestCases++;
                } else {
                    existingTestCases++;
                }
            }
        }

        await client.query("COMMIT");
        console.log("Transaction committed successfully.");

        // 2. Redis Cache Invalidation
        if (redis && isRedisReady()) {
            try {
                await redis.del("problems:all");
                console.log("Cleared Redis cache key: problems:all");
                for (const pid of problemIds) {
                    await redis.del(`problems:${pid}`);
                }
                console.log(`Cleared Redis cache keys for ${problemIds.length} problems.`);
            } catch (cacheErr) {
                console.warn("Failed to invalidate Redis cache keys:", cacheErr.message);
            }
        }

        console.log("\n================ SEED SUMMARY ================");
        console.log(`Total Dataset Definitions: ${dsaDataset.length}`);
        console.log(`Problems Inserted:         ${insertedProblems}`);
        console.log(`Problems Updated:          ${updatedProblems}`);
        console.log(`Test Cases Inserted:       ${insertedTestCases}`);
        console.log(`Test Cases Already Present: ${existingTestCases}`);
        console.log("==============================================\n");

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ Seed failed. Transaction rolled back:", error);
        process.exitCode = 1;
    } finally {
        client.release();
        if (redis && redis.isOpen) {
            await redis.quit();
        }
        await pool.end();
    }
}

if (require.main === module) {
    seedDsaProblems();
}

module.exports = seedDsaProblems;
