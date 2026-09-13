const pool = require("../../config/db");

/**
 * Initializes the problem_knowledge table and vector indexes in PostgreSQL.
 */
async function initKnowledgeSchema() {
    await pool.query("CREATE EXTENSION IF NOT EXISTS vector");

    await pool.query(`
        CREATE TABLE IF NOT EXISTS problem_knowledge (
            id SERIAL PRIMARY KEY,
            problem_id INTEGER NOT NULL,
            chunk_index INTEGER NOT NULL,
            content TEXT NOT NULL,
            content_hash VARCHAR(64) NOT NULL,
            metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
            embedding vector(384),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_problem_knowledge_problem
                FOREIGN KEY (problem_id)
                REFERENCES problems(id)
                ON DELETE CASCADE,
            CONSTRAINT uq_problem_knowledge_chunk
                UNIQUE (problem_id, chunk_index)
        );
    `);

    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_problem_knowledge_problem_id
        ON problem_knowledge(problem_id);
    `);

    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_problem_knowledge_embedding
        ON problem_knowledge USING hnsw (embedding vector_cosine_ops);
    `);
}

/**
 * Retrieves all existing chunk hashes and embeddings for a problem to enable idempotency.
 *
 * @param {number} problemId
 * @returns {Promise<Map<number, { contentHash: string, embedding: Array<number> }>>}
 */
async function getExistingChunksForProblem(problemId) {
    const res = await pool.query(
        `SELECT chunk_index, content_hash, embedding::text AS embedding_text
         FROM problem_knowledge
         WHERE problem_id = $1`,
        [problemId]
    );

    const map = new Map();
    for (const row of res.rows) {
        map.set(row.chunk_index, {
            contentHash: row.content_hash,
            embeddingText: row.embedding_text
        });
    }
    return map;
}

/**
 * Upserts a knowledge chunk into problem_knowledge.
 */
async function upsertKnowledgeChunk({
    problemId,
    chunkIndex,
    content,
    contentHash,
    metadata,
    embedding
}) {
    const vectorString = typeof embedding === "string" ? embedding : `[${embedding.join(",")}]`;

    const query = `
        INSERT INTO problem_knowledge (
            problem_id,
            chunk_index,
            content,
            content_hash,
            metadata,
            embedding,
            updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6::vector, CURRENT_TIMESTAMP)
        ON CONFLICT (problem_id, chunk_index)
        DO UPDATE SET
            content = EXCLUDED.content,
            content_hash = EXCLUDED.content_hash,
            metadata = EXCLUDED.metadata,
            embedding = EXCLUDED.embedding,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id;
    `;

    const res = await pool.query(query, [
        problemId,
        chunkIndex,
        content,
        contentHash,
        JSON.stringify(metadata),
        vectorString
    ]);

    return res.rows[0]?.id;
}

/**
 * Removes any chunks for a problem that no longer exist in the new document structure.
 */
async function removeStaleChunks(problemId, validChunkIndices) {
    if (!validChunkIndices || validChunkIndices.length === 0) {
        const res = await pool.query(
            "DELETE FROM problem_knowledge WHERE problem_id = $1 RETURNING id",
            [problemId]
        );
        return res.rowCount;
    }

    const res = await pool.query(
        "DELETE FROM problem_knowledge WHERE problem_id = $1 AND chunk_index != ALL($2::int[]) RETURNING id",
        [problemId, validChunkIndices]
    );
    return res.rowCount;
}

/**
 * Performs parameterized pgvector cosine similarity search.
 *
 * @param {Array<number>} queryVector - 384-dimensional query embedding
 * @param {number} topK - Maximum number of results to return
 * @returns {Promise<Array<Object>>} Top-K ranked knowledge chunks
 */
async function searchSimilarChunks(queryVector, topK = 5) {
    const vectorString = `[${queryVector.join(",")}]`;

    const query = `
        SELECT
            pk.id,
            pk.problem_id AS "problemId",
            pk.chunk_index AS "chunkIndex",
            pk.content,
            pk.metadata,
            1 - (pk.embedding <=> $1::vector) AS score
        FROM problem_knowledge pk
        WHERE pk.embedding IS NOT NULL
        ORDER BY pk.embedding <=> $1::vector ASC
        LIMIT $2;
    `;

    const res = await pool.query(query, [vectorString, topK]);

    return res.rows.map(row => ({
        id: row.id,
        problemId: row.problemId,
        chunkIndex: row.chunkIndex,
        title: row.metadata?.title || "Unknown Problem",
        topic: row.metadata?.topic || "General",
        difficulty: row.metadata?.difficulty || "Medium",
        content: row.content,
        metadata: row.metadata,
        score: parseFloat(parseFloat(row.score).toFixed(4))
    }));
}

/**
 * Returns summary statistics about the problem_knowledge table.
 */
async function getKnowledgeStats() {
    const totalRes = await pool.query("SELECT COUNT(*) AS total FROM problem_knowledge");
    const distinctRes = await pool.query("SELECT COUNT(DISTINCT problem_id) AS distinct_problems FROM problem_knowledge");
    const nullRes = await pool.query("SELECT COUNT(*) AS null_embeddings FROM problem_knowledge WHERE embedding IS NULL");

    return {
        totalChunks: parseInt(totalRes.rows[0].total, 10),
        distinctProblems: parseInt(distinctRes.rows[0].distinct_problems, 10),
        nullEmbeddings: parseInt(nullRes.rows[0].null_embeddings, 10)
    };
}

module.exports = {
    initKnowledgeSchema,
    getExistingChunksForProblem,
    upsertKnowledgeChunk,
    removeStaleChunks,
    searchSimilarChunks,
    getKnowledgeStats
};
