const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const { execFile, exec } = require("child_process");

const MAX_OUTPUT_LENGTH = 10000; // Limit output/error to 10,000 chars
const DOCKER_TIMEOUT_MS = 5000;  // 5 seconds execution timeout
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
 * Executes a Java source code submission inside an isolated Docker container
 * @param {string} sourceCode - Raw Java code containing class Main
 * @returns {Promise<{ status: string, output: string|null, error: string|null, executionTime: number }>}
 */
const executeJavaSubmission = async (sourceCode) => {
    // Create unique temporary directory on host
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "codelens-java-"));
    const mainFilePath = path.join(tempDir, "Main.java");
    
    // Assign a unique container name for precise timeout cleanup
    const containerName = `codelens-exec-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const startTime = Date.now();

    try {
        // Write Java source code to Main.java inside tempDir
        await fs.writeFile(mainFilePath, sourceCode, "utf8");

        // Docker CLI arguments for secure sandbox execution
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
            IMAGE_TAG
        ];

        // Execute container using fixed argument array (no shell interpolation)
        const result = await new Promise((resolve) => {
            let isTimedOut = false;
            let childProcess = null;

            // Execution timeout timer
            const timeoutTimer = setTimeout(() => {
                isTimedOut = true;
                if (childProcess) {
                    childProcess.kill("SIGKILL");
                }
                // Forcefully remove running container if stuck in infinite loop
                exec(`docker rm -f ${containerName}`, () => {});
                resolve({
                    isTimedOut: true,
                    stdout: "",
                    stderr: "Time Limit Exceeded (5s limit reached)",
                    exitCode: 124
                });
            }, DOCKER_TIMEOUT_MS);

            childProcess = execFile("docker", dockerArgs, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
                clearTimeout(timeoutTimer);
                if (isTimedOut) return;

                const exitCode = error ? error.code || 1 : 0;
                resolve({
                    isTimedOut: false,
                    stdout: stdout ? stdout.toString() : "",
                    stderr: stderr ? stderr.toString() : "",
                    exitCode: exitCode
                });
            });
        });

        const executionTime = Math.min(Date.now() - startTime, DOCKER_TIMEOUT_MS);

        // 1. Timeout Case
        if (result.isTimedOut) {
            return {
                status: "TIME_LIMIT_EXCEEDED",
                output: null,
                error: "Time Limit Exceeded (5.0s limit reached)",
                executionTime: DOCKER_TIMEOUT_MS
            };
        }

        const rawStdout = result.stdout || "";
        const rawStderr = result.stderr || "";

        // 2. Compilation Error Case
        if (rawStdout.includes("___COMPILATION_ERROR___")) {
            const compileErrorText = rawStdout.replace("___COMPILATION_ERROR___", "").trim();
            return {
                status: "COMPILATION_ERROR",
                output: null,
                error: truncate(compileErrorText || rawStderr || "Compilation Failed"),
                executionTime: executionTime
            };
        }

        // 3. Runtime Error Case
        if (result.exitCode !== 0) {
            return {
                status: "RUNTIME_ERROR",
                output: truncate(rawStdout) || null,
                error: truncate(rawStderr || rawStdout || `Runtime Error (exit code ${result.exitCode})`),
                executionTime: executionTime
            };
        }

        // 4. Successful Execution Case
        return {
            status: "EXECUTED",
            output: truncate(rawStdout) || null,
            error: rawStderr ? truncate(rawStderr) : null,
            executionTime: executionTime
        };

    } catch (err) {
        console.error("Java execution internal error:", err.message);
        throw err;
    } finally {
        // Always clean up host temporary workspace directory
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupErr) {
            console.error("Failed to clean temp directory:", cleanupErr.message);
        }
    }
};

module.exports = {
    executeJavaSubmission
};
