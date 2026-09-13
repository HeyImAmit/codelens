require("dotenv").config();
const { evaluateRetrieval } = require("../services/rag/evaluationService");
const pool = require("../config/db");

async function main() {
    try {
        await evaluateRetrieval();
        process.exit(0);
    } catch (error) {
        console.error("[RAG Evaluation Error]", error);
        process.exit(1);
    } finally {
        try {
            await pool.end();
        } catch (e) {}
    }
}

main();
