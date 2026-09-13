/**
 * Comprehensive Verification Test Suite for Milestone 7B: Production Hardening, Idempotency & Sandbox Resilience
 */
const pool = require("../config/db");
const { getRedisClient, isRedisReady, connectRedis } = require("../config/redis");
const { publishToQueue, getQueueInfo } = require("../config/rabbitmq");
const { logger } = require("../utils/logger");

const API_BASE = "http://localhost:5000";

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function clearRateLimits() {
    try {
        await connectRedis();
        const rClient = getRedisClient();
        if (isRedisReady()) {
            const keys = await rClient.keys("rate_limit:*");
            if (keys.length > 0) await rClient.del(keys);
        }
    } catch {}
}

async function runTestSuite7B() {
    console.log("\n==================================================");
    console.log("RUNNING MILESTONE 7B VERIFICATION TEST SUITE");
    console.log("==================================================\n");

    let passed = 0;
    let failed = 0;

    function assert(condition, testName, details = "") {
        if (condition) {
            console.log(`  [PASS] ${testName}`);
            passed++;
        } else {
            console.error(`  [FAIL] ${testName} - ${details}`);
            failed++;
        }
    }

    await clearRateLimits();

    // -------------------------------------------------------------
    // Test 1: HTTP Security Headers & Production CORS
    // -------------------------------------------------------------
    console.log("\n--- 1. Testing HTTP Security Headers & Options ---");
    try {
        const liveRes = await fetch(`${API_BASE}/health/live`);
        assert(liveRes.headers.get("x-content-type-options") === "nosniff", "X-Content-Type-Options: nosniff header present");
        assert(liveRes.headers.get("x-frame-options") === "DENY", "X-Frame-Options: DENY header present");
        assert(liveRes.headers.get("referrer-policy") === "no-referrer", "Referrer-Policy: no-referrer header present");
    } catch (err) {
        assert(false, "Security headers test", err.message);
    }

    // -------------------------------------------------------------
    // Test 2: Submission Request Validation Hardening
    // -------------------------------------------------------------
    console.log("\n--- 2. Testing Submission API Validation & Boundaries ---");
    try {
        // A. Negative problemId
        const negRes = await fetch(`${API_BASE}/api/submissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ problemId: -1, language: "java", sourceCode: "class Main {}" })
        });
        assert(negRes.status === 400, "Negative problemId rejected with 400 Bad Request");

        // B. Non-integer problemId
        const floatRes = await fetch(`${API_BASE}/api/submissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ problemId: 1.5, language: "java", sourceCode: "class Main {}" })
        });
        assert(floatRes.status === 400, "Floating point problemId rejected with 400 Bad Request");

        // C. Unsupported language
        const langRes = await fetch(`${API_BASE}/api/submissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ problemId: 1, language: "python_unsupported", sourceCode: "print(1)" })
        });
        assert(langRes.status === 400, "Unsupported language rejected with 400 Bad Request");

        // D. Oversized source code (> 50KB)
        const hugeCode = "public class Main { " + "int x = 1; ".repeat(5000) + " }";
        const bigRes = await fetch(`${API_BASE}/api/submissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ problemId: 1, language: "java", sourceCode: hugeCode })
        });
        assert(bigRes.status === 400, "Oversized sourceCode (> 50KB) rejected with 400 Bad Request");

        // E. Non-existent problem
        const missingRes = await fetch(`${API_BASE}/api/submissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ problemId: 999999, language: "java", sourceCode: "public class Main {}" })
        });
        assert(missingRes.status === 404, "Non-existent problem rejected with 404 Not Found");
    } catch (err) {
        assert(false, "Validation hardening tests", err.message);
    }

    // -------------------------------------------------------------
    // Test 3: Runaway Output Limiting & Stream Termination
    // -------------------------------------------------------------
    console.log("\n--- 3. Testing Runaway Output Protection & Sandbox Bounding ---");
    try {
        await clearRateLimits();
        const runawayCode = `public class Main {
    public static void main(String[] args) {
        while (true) {
            System.out.println("RUNAWAY_OUTPUT_SPAM_TEST_1234567890_EXCESSIVE_BUFFER_FLOOD");
        }
    }
}`;
        const runRes = await fetch(`${API_BASE}/api/submissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ problemId: 1, language: "java", sourceCode: runawayCode })
        });
        const runData = await runRes.json();
        const subId = runData.id;

        let verdict = "PENDING";
        let subDetails = null;
        for (let i = 0; i < 25; i++) {
            await sleep(1000);
            const pollRes = await fetch(`${API_BASE}/api/submissions/${subId}`);
            if (pollRes.status === 200) {
                subDetails = await pollRes.json();
                verdict = subDetails.status;
                if (verdict !== "PENDING" && verdict !== "RUNNING") break;
            }
        }

        assert(
            verdict === "RUNTIME_ERROR" || verdict === "TIME_LIMIT_EXCEEDED",
            `Runaway output terminates safely without backend crash (Verdict: ${verdict})`
        );
        assert(
            (subDetails?.output?.length || 0) <= 10500,
            `Stored output is bounded below maximum DB limit (Stored length: ${subDetails?.output?.length || 0})`
        );
    } catch (err) {
        assert(false, "Runaway output test", err.message);
    }

    // -------------------------------------------------------------
    // Test 4: Submission Pipeline Idempotency (Duplicate Messages)
    // -------------------------------------------------------------
    console.log("\n--- 4. Testing Submission Pipeline Idempotency ---");
    try {
        await clearRateLimits();
        await sleep(1000);

        // Step A: Submit a correct solution to reach ACCEPTED
        const correctCode = `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int target = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < n; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) {
                System.out.println(map.get(comp) + " " + i);
                return;
            }
            map.put(nums[i], i);
        }
    }
}`;
        const subRes = await fetch(`${API_BASE}/api/submissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ problemId: 1, language: "java", sourceCode: correctCode })
        });
        const subData = await subRes.json();
        const initialSubId = subData.id;

        // Poll until ACCEPTED
        let initialVerdict = "PENDING";
        for (let i = 0; i < 25; i++) {
            await sleep(1000);
            const pollRes = await fetch(`${API_BASE}/api/submissions/${initialSubId}`);
            if (pollRes.status === 200) {
                const pollData = await pollRes.json();
                initialVerdict = pollData.status;
                if (initialVerdict === "ACCEPTED") break;
            }
        }
        assert(initialVerdict === "ACCEPTED", `Initial submission reached ACCEPTED (got: ${initialVerdict})`);

        // Step B: Send DUPLICATE message for the same submissionId
        await publishToQueue("code-execution", {
            submissionId: initialSubId,
            requestId: "duplicate-test-correlation-id"
        });

        // Wait to allow worker to process duplicate message
        await sleep(2000);

        // Verify status remains ACCEPTED and was NOT corrupted or reverted to RUNNING
        const duplicateCheckRes = await fetch(`${API_BASE}/api/submissions/${initialSubId}`);
        const duplicateCheckData = await duplicateCheckRes.json();

        assert(
            duplicateCheckData.status === "ACCEPTED",
            `Duplicate delivery safely skipped; status remains ACCEPTED (Status: ${duplicateCheckData.status})`
        );
        assert(
            Boolean(duplicateCheckData.output && duplicateCheckData.output.includes("passed")),
            "Verdict output remains intact without corruption"
        );
    } catch (err) {
        assert(false, "Pipeline idempotency test", err.message);
    }

    // -------------------------------------------------------------
    // Test 5: Full Execution Verdicts Regression
    // -------------------------------------------------------------
    console.log("\n--- 5. Testing Verdicts Regression Suite ---");
    async function testCodeVerdict(sourceCode, expectedVerdict, desc) {
        await clearRateLimits();
        const res = await fetch(`${API_BASE}/api/submissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ problemId: 1, language: "java", sourceCode })
        });
        if (res.status !== 201) {
            assert(false, desc, `Failed to submit: ${res.status}`);
            return;
        }
        const data = await res.json();
        const subId = data.id;

        let verdict = "PENDING";
        for (let i = 0; i < 25; i++) {
            await sleep(1000);
            const pollRes = await fetch(`${API_BASE}/api/submissions/${subId}`);
            if (pollRes.status === 200) {
                const pollData = await pollRes.json();
                verdict = pollData.status;
                if (verdict !== "PENDING" && verdict !== "RUNNING") break;
            }
        }
        assert(verdict === expectedVerdict, `${desc} produced ${expectedVerdict} (got: ${verdict})`);
    }

    await testCodeVerdict(
        `public class Main { public static void main(String[] args) { System.out.println("999 999"); } }`,
        "WRONG_ANSWER",
        "Wrong Answer verdict"
    );

    await testCodeVerdict(
        `public class Main { public static void main(String[] args) { syntax_error_here } }`,
        "COMPILATION_ERROR",
        "Compilation Error verdict"
    );

    await testCodeVerdict(
        `public class Main { public static void main(String[] args) { int[] a = new int[0]; a[5] = 10; } }`,
        "RUNTIME_ERROR",
        "Runtime Error verdict"
    );

    await testCodeVerdict(
        `public class Main { public static void main(String[] args) { while (true) {} } }`,
        "TIME_LIMIT_EXCEEDED",
        "Time Limit Exceeded verdict"
    );

    // -------------------------------------------------------------
    // Test 6: AI & RAG Protection & Retrieval
    // -------------------------------------------------------------
    console.log("\n--- 6. Testing AI & RAG Endpoints Protection ---");
    try {
        await sleep(1000);
        const tutorRes = await fetch(`${API_BASE}/api/ai/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: "Explain two sum hash map intuition", topK: 2 })
        });
        const tutorData = await tutorRes.json();
        assert(tutorRes.status === 200 && tutorData.success === true, "AI Tutor functional with RAG context");

        await sleep(1000);
        const reviewRes = await fetch(`${API_BASE}/api/ai/review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                problemId: 1,
                language: "java",
                sourceCode: "public class Main { public static void main(String[] args) {} }"
            })
        });
        const reviewData = await reviewRes.json();
        assert(reviewRes.status === 200 && reviewData.success === true, "AI Code Review functional");

        await sleep(1000);
        const hintRes = await fetch(`${API_BASE}/api/ai/hint`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ problemId: 1, level: 1 })
        });
        const hintData = await hintRes.json();
        assert(hintRes.status === 200 && hintData.success === true, "Progressive AI Hints functional");
    } catch (err) {
        assert(false, "AI & RAG tests", err.message);
    }

    console.log("\n==================================================");
    console.log(`MILESTONE 7B RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================\n");

    try {
        const rClient = getRedisClient();
        if (rClient.isOpen) await rClient.quit();
    } catch {}

    await pool.end();
    process.exit(failed > 0 ? 1 : 0);
}

runTestSuite7B().catch((err) => {
    console.error("Test Suite 7B crashed:", err);
    process.exit(1);
});
