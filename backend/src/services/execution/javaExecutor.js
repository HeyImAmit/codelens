const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const { execFile, exec, spawn } = require("child_process");
const { compareOutputs } = require("./outputComparator");

const MAX_OUTPUT_LENGTH = 10000;      // 10,000 characters output limit
const COMPILATION_TIMEOUT_MS = 10000; // 10s timeout for compilation
const TEST_CASE_TIMEOUT_MS = 5000;    // 5s timeout per test case
const IMAGE_TAG = "codelens-java-runner:1.0";

/**
 * Truncates string output to maximum safe database storage limit
 */
const truncate = (str) => {
    if (!str) return "";
    const trimmed = String(str).trim();
    if (trimmed.length > MAX_OUTPUT_LENGTH) {
        return trimmed.substring(0, MAX_OUTPUT_LENGTH) + "\n...[Output Truncated]";
    }
    return trimmed;
};

/**
 * Compiles Java source code once inside Docker sandbox
 */
const compileJava = (tempDir) => {
    return new Promise((resolve) => {
        const containerName = `codelens-compile-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const dockerArgs = [
            "run",
            "--name", containerName,
            "--rm",
            "--network", "none",
            "--cpus", "1.0",
            "-m", "256m",
            "--pids-limit", "64",
            "--cap-drop", "ALL",
            "--security-opt", "no-new-privileges:true",
            "-u", "1000:1000",
            "-v", `${tempDir}:/app`,
            "-w", "/app",
            IMAGE_TAG,
            "compile"
        ];

        let isTimedOut = false;
        let childProcess = null;

        const timer = setTimeout(() => {
            isTimedOut = true;
            if (childProcess) childProcess.kill("SIGKILL");
            exec(`docker rm -f ${containerName}`, () => {});
            resolve({
                success: false,
                isTimedOut: true,
                error: "Compilation Time Limit Exceeded (10s)"
            });
        }, COMPILATION_TIMEOUT_MS);

        childProcess = execFile("docker", dockerArgs, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
            clearTimeout(timer);
            if (isTimedOut) return;

            const rawStdout = stdout ? stdout.toString() : "";
            const rawStderr = stderr ? stderr.toString() : "";

            if (rawStdout.includes("___COMPILATION_ERROR___") || (error && error.code !== 0)) {
                const compileError = rawStdout.replace("___COMPILATION_ERROR___", "").trim();
                resolve({
                    success: false,
                    isTimedOut: false,
                    error: compileError || rawStderr || "Compilation Failed"
                });
            } else {
                resolve({
                    success: true,
                    isTimedOut: false,
                    error: null
                });
            }
        });
    });
};

/**
 * Runs a single test case through the compiled Java program via stdin
 */
const runTestCase = (tempDir, input) => {
    return new Promise((resolve) => {
        const containerName = `codelens-run-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const dockerArgs = [
            "run",
            "-i",
            "--name", containerName,
            "--rm",
            "--network", "none",
            "--cpus", "1.0",
            "-m", "256m",
            "--pids-limit", "64",
            "--cap-drop", "ALL",
            "--security-opt", "no-new-privileges:true",
            "-u", "1000:1000",
            "-v", `${tempDir}:/app`,
            "-w", "/app",
            IMAGE_TAG,
            "run"
        ];

        const startTime = Date.now();
        let isTimedOut = false;
        let stdout = "";
        let stderr = "";

        const child = spawn("docker", dockerArgs);

        const timer = setTimeout(() => {
            isTimedOut = true;
            child.kill("SIGKILL");
            exec(`docker rm -f ${containerName}`, () => {});
            resolve({
                isTimedOut: true,
                stdout: "",
                stderr: "Time Limit Exceeded (5.0s)",
                exitCode: 124,
                duration: TEST_CASE_TIMEOUT_MS
            });
        }, TEST_CASE_TIMEOUT_MS);

        if (child.stdin) {
            child.stdin.write(input || "");
            child.stdin.end();
        }

        if (child.stdout) {
            child.stdout.on("data", (data) => {
                stdout += data.toString();
            });
        }

        if (child.stderr) {
            child.stderr.on("data", (data) => {
                stderr += data.toString();
            });
        }

        child.on("error", (err) => {
            clearTimeout(timer);
            if (!isTimedOut) {
                resolve({
                    isTimedOut: false,
                    stdout: stdout,
                    stderr: err.message,
                    exitCode: 1,
                    duration: Date.now() - startTime
                });
            }
        });

        child.on("close", (code) => {
            clearTimeout(timer);
            if (!isTimedOut) {
                resolve({
                    isTimedOut: false,
                    stdout: stdout,
                    stderr: stderr,
                    exitCode: code !== null ? code : 0,
                    duration: Date.now() - startTime
                });
            }
        });
    });
};

/**
 * Evaluates Java submission against test cases
 * @param {string} sourceCode - User Java source code
 * @param {Array<{ id: number, input: string, expected_output: string }>} testCases - List of problem test cases
 * @returns {Promise<{ status: string, output: string|null, error: string|null, executionTime: number }>}
 */
const executeJavaSubmission = async (sourceCode, testCases = []) => {
    if (!testCases || testCases.length === 0) {
        return {
            status: "RUNTIME_ERROR",
            output: null,
            error: "No test cases configured for this problem.",
            executionTime: 0
        };
    }

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "codelens-java-"));
    const mainFilePath = path.join(tempDir, "Main.java");

    let totalExecutionTime = 0;

    try {
        // Write Java source code to Main.java
        await fs.writeFile(mainFilePath, sourceCode, "utf8");

        // 1. Compile Once
        const compileStart = Date.now();
        const compileResult = await compileJava(tempDir);
        const compileDuration = Date.now() - compileStart;
        totalExecutionTime += compileDuration;

        if (!compileResult.success) {
            return {
                status: compileResult.isTimedOut ? "TIME_LIMIT_EXCEEDED" : "COMPILATION_ERROR",
                output: null,
                error: truncate(compileResult.error),
                executionTime: totalExecutionTime
            };
        }

        // 2. Sequential Test Case Execution with Early Termination
        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            const runRes = await runTestCase(tempDir, tc.input);

            totalExecutionTime += runRes.duration;

            // Timeout check
            if (runRes.isTimedOut) {
                return {
                    status: "TIME_LIMIT_EXCEEDED",
                    output: null,
                    error: `Time Limit Exceeded on test case ${i + 1} (5.0s limit)`,
                    executionTime: totalExecutionTime
                };
            }

            // Runtime Error check
            if (runRes.exitCode !== 0) {
                return {
                    status: "RUNTIME_ERROR",
                    output: truncate(runRes.stdout) || null,
                    error: truncate(runRes.stderr || runRes.stdout || `Runtime Error on test case ${i + 1} (exit code ${runRes.exitCode})`),
                    executionTime: totalExecutionTime
                };
            }

            // Output comparison check
            const isMatch = compareOutputs(runRes.stdout, tc.expected_output);
            if (!isMatch) {
                return {
                    status: "WRONG_ANSWER",
                    output: truncate(runRes.stdout) || null,
                    error: `Wrong Answer on test case ${i + 1}.`,
                    executionTime: totalExecutionTime
                };
            }
        }

        // 3. All test cases passed -> ACCEPTED
        return {
            status: "ACCEPTED",
            output: `All ${testCases.length} test cases passed.`,
            error: null,
            executionTime: totalExecutionTime
        };

    } catch (err) {
        console.error("Java executor internal error:", err.message);
        throw err;
    } finally {
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupErr) {
            console.error("Temp dir cleanup error:", cleanupErr.message);
        }
    }
};

module.exports = {
    executeJavaSubmission
};
