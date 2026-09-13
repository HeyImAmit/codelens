/**
 * Comprehensive Verification Suite for Milestone 7A: Production Hardening & Observability
 */
const pool = require("../config/db");
const { getRedisClient, isRedisReady } = require("../config/redis");
const { publishToQueue, getQueueInfo } = require("../config/rabbitmq");
const { logger, sanitizeMeta } = require("../utils/logger");

const API_BASE = "http://localhost:5000";

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTestSuite() {
    console.log("\n==================================================");
    console.log("RUNNING MILESTONE 7A VERIFICATION TEST SUITE");
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

    // -------------------------------------------------------------
    // Test 1: Logger Sanitization & Safety Filter
    // -------------------------------------------------------------
    console.log("\n--- 1. Testing Logger Sanitization & Secret Redaction ---");
    const dirtyMeta = {
        password: "super_secret_db_password",
        apiKey: "gsk_1234567890abcdef",
        sourceCode: "public class Solution { ... }",
        prompt: "You are an AI tutor...",
        problemId: 1,
        normalField: "safe value"
    };
    const cleanMeta = sanitizeMeta(dirtyMeta);

    assert(cleanMeta.password === "[REDACTED]", "Password is redacted");
    assert(cleanMeta.apiKey === "[REDACTED]", "API Key is redacted");
    assert(cleanMeta.sourceCode === "[REDACTED]", "Source code is redacted");
    assert(cleanMeta.prompt === "[REDACTED]", "Prompt is redacted");
    assert(cleanMeta.problemId === 1, "Non-sensitive number is preserved");
    assert(cleanMeta.normalField === "safe value", "Non-sensitive string is preserved");

    // -------------------------------------------------------------
    // Test 2: Request ID Generation & Preservation in API
    // -------------------------------------------------------------
    console.log("\n--- 2. Testing Request ID Generation & Preservation ---");
    try {
        // A. Generated when missing
        const resAutoId = await fetch(`${API_BASE}/health/live`);
        const headerId = resAutoId.headers.get("x-request-id");
        const bodyAuto = await resAutoId.json();
        assert(resAutoId.status === 200, "GET /health/live returns 200 OK");
        assert(Boolean(headerId && headerId.length >= 10), "X-Request-ID header is generated when omitted", `Got: ${headerId}`);

        // B. Preserved when provided
        const customRequestId = "test-custom-trace-uuid-12345";
        const resCustom = await fetch(`${API_BASE}/health/live`, {
            headers: { "X-Request-ID": customRequestId }
        });
        const returnedCustomId = resCustom.headers.get("x-request-id");
        assert(returnedCustomId === customRequestId, "Custom X-Request-ID is preserved and echoed in response header", `Expected ${customRequestId}, got ${returnedCustomId}`);
    } catch (err) {
        assert(false, "Request ID HTTP tests", err.message);
    }

    // -------------------------------------------------------------
    // Test 3: Health Endpoints (/health/live & /health/ready)
    // -------------------------------------------------------------
    console.log("\n--- 3. Testing Health Endpoints ---");
    try {
        // Liveness
        const liveRes = await fetch(`${API_BASE}/health/live`);
        const liveData = await liveRes.json();
        assert(liveData.status === "ok", "/health/live status is 'ok'");
        assert(liveData.service === "api", "/health/live service is 'api'");
        assert(typeof liveData.uptimeSeconds === "number", "/health/live provides uptimeSeconds");

        // Readiness
        const readyRes = await fetch(`${API_BASE}/health/ready`);
        const readyData = await readyRes.json();
        assert(readyData.status === "ok" || readyData.status === "degraded", "/health/ready returns status");
        assert(readyData.dependencies?.postgres?.status === "ok", "PostgreSQL health is 'ok'");
        assert(readyData.dependencies?.redis?.status === "ok" || readyData.dependencies?.redis?.status === "down", "Redis health is accurately reported");
        assert(readyData.dependencies?.rabbitmq?.status === "ok", "RabbitMQ health is 'ok'");
        assert(typeof readyData.workers?.activeConsumers === "number", "RabbitMQ active worker consumer count is reported", `Consumers: ${readyData.workers?.activeConsumers}`);
    } catch (err) {
        assert(false, "Health endpoint tests", err.message);
    }

    // -------------------------------------------------------------
    // Test 4: Centralized Error Handler (No Stack Traces Leaked)
    // -------------------------------------------------------------
    console.log("\n--- 4. Testing Centralized Error Handling & Security ---");
    try {
        // 404 Not Found
        const notFoundRes = await fetch(`${API_BASE}/api/non-existent-endpoint-path`);
        const notFoundData = await notFoundRes.json();
        assert(notFoundRes.status === 404, "404 returned for non-existent endpoint");
        assert(!notFoundData.stack, "404 response does not leak stack trace");
        assert(Boolean(notFoundData.requestId), "404 response includes requestId");

        // 400 Validation Error on Submission
        const badSubRes = await fetch(`${API_BASE}/api/submissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        });
        const badSubData = await badSubRes.json();
        assert(badSubRes.status === 400, "400 returned for missing submission body fields");
        assert(!badSubData.stack, "400 response does not leak stack trace");
        assert(Boolean(badSubData.requestId), "400 response includes requestId");
    } catch (err) {
        assert(false, "Error handling tests", err.message);
    }

    // -------------------------------------------------------------
    // Test 5: Submission Creation with Correlated Request ID
    // -------------------------------------------------------------
    console.log("\n--- 5. Testing Submission Pipeline with Correlated Request ID ---");
    const traceRequestId = `trace-eval-${Date.now()}`;
    let createdSubmissionId = null;

    try {
        const createSubRes = await fetch(`${API_BASE}/api/submissions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Request-ID": traceRequestId
            },
            body: JSON.stringify({
                problemId: 1, // Two Sum
                language: "java",
                sourceCode: `import java.util.*;
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
}`
            })
        });

        assert(createSubRes.status === 201, "Submission created with 201 Created");
        assert(createSubRes.headers.get("x-request-id") === traceRequestId, "Submission response echoed trace request ID");

        const subData = await createSubRes.json();
        createdSubmissionId = subData.id;
        assert(Boolean(createdSubmissionId), "Submission received an ID from DB", `ID: ${createdSubmissionId}`);
    } catch (err) {
        assert(false, "Submission creation test", err.message);
    }

    // -------------------------------------------------------------
    // Test 6: Worker Execution & Polling (ACCEPTED Verdict)
    // -------------------------------------------------------------
    console.log("\n--- 6. Testing Worker Asynchronous Execution ---");
    if (createdSubmissionId) {
        let finalVerdict = "PENDING";
        for (let i = 0; i < 20; i++) {
            await sleep(1000);
            const getRes = await fetch(`${API_BASE}/api/submissions/${createdSubmissionId}`);
            if (getRes.status === 200) {
                const data = await getRes.json();
                finalVerdict = data.status;
                if (finalVerdict !== "PENDING" && finalVerdict !== "RUNNING") {
                    break;
                }
            }
        }
        assert(finalVerdict === "ACCEPTED", `Submission evaluated to ACCEPTED (got: ${finalVerdict})`);
    }

    // -------------------------------------------------------------
    // Test 7: Worker Backward Compatibility (Legacy Payload)
    // -------------------------------------------------------------
    console.log("\n--- 7. Testing Worker Legacy Message Compatibility ---");
    try {
        // Create a DB record directly
        const dbRes = await pool.query(
            `INSERT INTO submissions (problem_id, language, source_code, status)
             VALUES (1, 'java', 'import java.util.*;\npublic class Main { public static void main(String[] args) { Scanner sc = new Scanner(System.in); int n = sc.nextInt(); for(int i=0;i<n;i++) sc.nextInt(); int target = sc.nextInt(); System.out.println("0 1"); } }', 'PENDING')
             RETURNING id`
        );
        const legacySubId = dbRes.rows[0].id;

        // Publish legacy payload WITHOUT requestId
        await publishToQueue("code-execution", {
            submissionId: legacySubId
        });

        let legacyVerdict = "PENDING";
        for (let i = 0; i < 20; i++) {
            await sleep(1000);
            const getRes = await fetch(`${API_BASE}/api/submissions/${legacySubId}`);
            if (getRes.status === 200) {
                const data = await getRes.json();
                legacyVerdict = data.status;
                if (legacyVerdict !== "PENDING" && legacyVerdict !== "RUNNING") {
                    break;
                }
            }
        }
        assert(legacyVerdict !== "PENDING", `Worker processed legacy message format without crashing (Verdict: ${legacyVerdict})`);
    } catch (err) {
        assert(false, "Legacy payload test", err.message);
    }

    // -------------------------------------------------------------
    // Test 8: All Java Execution Verdicts Regression
    // -------------------------------------------------------------
    console.log("\n--- 8. Testing All Execution Verdicts (WRONG_ANSWER, COMPILATION_ERROR, RUNTIME_ERROR, TIME_LIMIT_EXCEEDED) ---");
    
    // Clear rate limit keys for the test client IP to avoid false 429 during automated testing
    try {
        const rClient = getRedisClient();
        if (isRedisReady()) {
            const keys = await rClient.keys("rate_limit:submission:*");
            if (keys.length > 0) await rClient.del(keys);
        }
    } catch {}

    async function testCodeVerdict(sourceCode, expectedVerdict, desc) {
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
        for (let i = 0; i < 20; i++) {
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
        "Wrong logic"
    );

    await testCodeVerdict(
        `public class Main { public static void main(String[] args) { syntax_error_here } }`,
        "COMPILATION_ERROR",
        "Syntax error"
    );

    await testCodeVerdict(
        `public class Main { public static void main(String[] args) { int[] a = new int[0]; a[5] = 10; } }`,
        "RUNTIME_ERROR",
        "Runtime exception"
    );

    await testCodeVerdict(
        `public class Main { public static void main(String[] args) { while (true) {} } }`,
        "TIME_LIMIT_EXCEEDED",
        "Infinite loop"
    );

    // -------------------------------------------------------------
    // Test 9: AI Endpoints Regression & Timing Observability
    // -------------------------------------------------------------
    console.log("\n--- 9. Testing AI & RAG Observability Endpoints ---");
    try {
        // AI Tutor
        await sleep(1000);
        const tutorRes = await fetch(`${API_BASE}/api/ai/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: "How to find two numbers that add up to target in O(n) time?", topK: 2 })
        });
        const tutorData = await tutorRes.json();
        assert(tutorRes.status === 200 && tutorData.success === true, "POST /api/ai/ask succeeds");
        assert(Boolean(tutorData.timing && tutorData.timing.retrievalMs !== undefined), "AI Tutor returns timing metadata");

        // AI Code Review
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
        assert(reviewRes.status === 200 && reviewData.success === true, "POST /api/ai/review succeeds");
        assert(Boolean(reviewData.timing && reviewData.timing.totalMs !== undefined), "AI Review returns timing metadata");

        // Progressive AI Hint
        await sleep(1000);
        const hintRes = await fetch(`${API_BASE}/api/ai/hint`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ problemId: 1, level: 1 })
        });
        const hintData = await hintRes.json();
        assert(hintRes.status === 200 && hintData.success === true, "POST /api/ai/hint succeeds");
        assert(Boolean(hintData.timing && hintData.timing.totalMs !== undefined), "AI Hint returns timing metadata");
    } catch (err) {
        assert(false, "AI endpoints regression", err.message);
    }

    console.log("\n==================================================");
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================\n");

    await pool.end();
    process.exit(failed > 0 ? 1 : 0);
}

runTestSuite().catch((err) => {
    console.error("Test Suite crashed:", err);
    process.exit(1);
});
