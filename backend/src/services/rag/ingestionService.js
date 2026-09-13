const crypto = require("crypto");
const pool = require("../../config/db");
const { buildProblemDocument } = require("./documentBuilder");
const { splitProblemDocument } = require("./textSplitter");
const { embedText } = require("./embeddingService");
const {
    initKnowledgeSchema,
    getExistingChunksForProblem,
    upsertKnowledgeChunk,
    removeStaleChunks,
    getKnowledgeStats
} = require("./knowledgeRepository");

/**
 * Generates a SHA-256 hash of text content.
 */
function computeContentHash(content) {
    return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

/**
 * Runs deterministic knowledge ingestion for all DSA problems.
 *
 * @returns {Promise<Object>} Ingestion summary statistics
 */
async function runKnowledgeIngestion() {
    console.log("[RAG Ingestion] Initializing knowledge schema and vector extension...");
    await initKnowledgeSchema();

    console.log("[RAG Ingestion] Fetching problems from PostgreSQL...");
    const problemsRes = await pool.query(
        "SELECT * FROM problems ORDER BY id ASC"
    );
    const problems = problemsRes.rows;

    console.log(`[RAG Ingestion] Found ${problems.length} problems to process.`);

    const metrics = {
        problemsProcessed: problems.length,
        documentsGenerated: 0,
        chunksGenerated: 0,
        embeddingsGenerated: 0,
        embeddingsReused: 0,
        rowsUpserted: 0,
        staleChunksRemoved: 0
    };

    for (const problem of problems) {
        const doc = buildProblemDocument(problem);
        metrics.documentsGenerated++;

        const chunks = await splitProblemDocument(doc);
        const existingChunksMap = await getExistingChunksForProblem(problem.id);
        const validIndices = [];

        for (const chunk of chunks) {
            metrics.chunksGenerated++;
            validIndices.push(chunk.chunkIndex);

            const contentHash = computeContentHash(chunk.content);
            const existing = existingChunksMap.get(chunk.chunkIndex);

            let embedding;
            if (existing && existing.contentHash === contentHash && existing.embeddingText) {
                // Content is identical: reuse existing embedding without LLM/onnx inference
                embedding = existing.embeddingText;
                metrics.embeddingsReused++;
            } else {
                // Content is new or modified: generate fresh embedding
                embedding = await embedText(chunk.content);
                metrics.embeddingsGenerated++;
            }

            await upsertKnowledgeChunk({
                problemId: problem.id,
                chunkIndex: chunk.chunkIndex,
                content: chunk.content,
                contentHash,
                metadata: chunk.metadata,
                embedding
            });
            metrics.rowsUpserted++;
        }

        // Clean up any stale chunks if the problem was re-split into fewer chunks
        const removedCount = await removeStaleChunks(problem.id, validIndices);
        metrics.staleChunksRemoved += removedCount;
    }

    const dbStats = await getKnowledgeStats();

    console.log("[RAG Ingestion] Ingestion completed successfully!");
    console.log("---------------------------------------------");
    console.log(`Problems processed:      ${metrics.problemsProcessed}`);
    console.log(`Documents generated:     ${metrics.documentsGenerated}`);
    console.log(`Chunks generated:        ${metrics.chunksGenerated}`);
    console.log(`Embeddings generated:    ${metrics.embeddingsGenerated}`);
    console.log(`Embeddings reused:       ${metrics.embeddingsReused}`);
    console.log(`Rows upserted:           ${metrics.rowsUpserted}`);
    console.log(`Stale chunks removed:    ${metrics.staleChunksRemoved}`);
    console.log(`Total database chunks:   ${dbStats.totalChunks}`);
    console.log(`Distinct problems in DB: ${dbStats.distinctProblems}`);
    console.log(`Null embeddings in DB:   ${dbStats.nullEmbeddings}`);
    console.log("---------------------------------------------");

    return {
        ...metrics,
        dbStats
    };
}

module.exports = {
    runKnowledgeIngestion,
    computeContentHash
};
