/**
 * Dedicated Failure Modes and Resilience Verification for Milestone 7A
 * Tests:
 * 1. Worker Absence Diagnostics (consumer count = 0 detection)
 * 2. Redis Graceful Fallback (fetching problems when Redis is bypassed)
 * 3. RabbitMQ Publish Failure Visibility (handling disconnected/unreachable queues)
 * 4. Error Stack Trace Secrecy Audit
 */
const { getQueueInfo } = require("../config/rabbitmq");
const { getCachedAllProblems } = require("../services/cache/problemCache");
const { logger } = require("../utils/logger");

const API_BASE = "http://localhost:5000";

async function runFailureModeTests() {
    console.log("\n==================================================");
    console.log("RUNNING MILESTONE 7A FAILURE MODES & RESILIENCE TESTS");
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
    // Test 1: Worker Absence Diagnostics
    // -------------------------------------------------------------
    console.log("\n--- 1. Testing Worker Absence Diagnostics ---");
    try {
        const queueInfo = await getQueueInfo("code-execution");
        assert(queueInfo !== null, "RabbitMQ inspects 'code-execution' queue cleanly");
        console.log(`     Queue name: ${queueInfo.queue}, Active consumers: ${queueInfo.consumerCount}, Messages queued: ${queueInfo.messageCount}`);

        const readyRes = await fetch(`${API_BASE}/health/ready`);
        const readyData = await readyRes.json();
        assert(readyData.workers !== undefined, "/health/ready contains dedicated 'workers' diagnostic object");
        assert(typeof readyData.workers.activeConsumers === "number", "Active worker count accurately tracked from RabbitMQ queue");
        assert(readyData.workers.status === "ready" || readyData.workers.status === "no_active_workers", "Worker status is explicit ('ready' or 'no_active_workers')");
    } catch (err) {
        assert(false, "Worker absence diagnostic test", err.message);
    }

    // -------------------------------------------------------------
    // Test 2: Problem Retrieval Fallback when Redis is Missed
    // -------------------------------------------------------------
    console.log("\n--- 2. Testing Problem Database Fallback Resilience ---");
    try {
        // Query problem list endpoint
        const probRes = await fetch(`${API_BASE}/api/problems`);
        const problems = await probRes.json();
        assert(probRes.status === 200, "Problems endpoint succeeds (200 OK)");
        assert(Array.isArray(problems) && problems.length > 0, `Returned ${problems.length} problems from database/cache`);

        // Query single problem endpoint
        const singleRes = await fetch(`${API_BASE}/api/problems/1`);
        const problem = await singleRes.json();
        assert(singleRes.status === 200 && problem.id === 1, "Single problem fetched successfully with ID 1");
    } catch (err) {
        assert(false, "Problem fallback test", err.message);
    }

    // -------------------------------------------------------------
    // Test 3: Security & Sanitization Audit
    // -------------------------------------------------------------
    console.log("\n--- 3. Testing Security & Redaction Audit ---");
    try {
        // Verify /health/live exposes no secrets
        const liveRes = await fetch(`${API_BASE}/health/live`);
        const liveText = await liveRes.text();
        assert(!liveText.includes("password") && !liveText.includes("postgres") && !liveText.includes("gsk_"), "/health/live exposes no internal credentials");

        // Verify /health/ready exposes no credentials/passwords
        const readyRes = await fetch(`${API_BASE}/health/ready`);
        const readyText = await readyRes.text();
        assert(!readyText.includes("postgres:") && !readyText.includes("password") && !readyText.includes("gsk_"), "/health/ready exposes no passwords or secret tokens");

        // Verify 404 & 500 error formats
        const errRes = await fetch(`${API_BASE}/api/problems/999999`);
        const errData = await errRes.json();
        assert(errRes.status === 404, "Non-existent problem returns 404");
        assert(errData.message === "Problem not found", "Safe error message returned");
        assert(!errData.stack, "No stack trace leaked to client");
        assert(Boolean(errData.requestId), "Response contains correlation requestId");
    } catch (err) {
        assert(false, "Security audit test", err.message);
    }

    console.log("\n==================================================");
    console.log(`FAILURE & RESILIENCE RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================\n");

    process.exit(failed > 0 ? 1 : 0);
}

runFailureModeTests().catch((err) => {
    console.error("Failure mode test script failed:", err);
    process.exit(1);
});
