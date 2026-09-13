require("dotenv").config();
const { runKnowledgeIngestion } = require("../services/rag/ingestionService");
const pool = require("../config/db");

async function main() {
    try {
        await runKnowledgeIngestion();
        process.exit(0);
    } catch (error) {
        console.error("[RAG Ingestion Error]", error);
        process.exit(1);
    } finally {
        try {
            await pool.end();
        } catch (e) {}
    }
}

main();
