const { embedText } = require("./embeddingService");
const { searchSimilarChunks } = require("./knowledgeRepository");

/**
 * Retrieves the top-K semantically relevant knowledge chunks for a query.
 *
 * @param {string} query - Natural language search query
 * @param {number} [topK=5] - Number of top chunks to return (1-10)
 * @returns {Promise<Array<Object>>} Normalized relevant knowledge chunks with similarity scores
 */
async function retrieveRelevantKnowledge(query, topK = 5) {
    if (typeof query !== "string" || query.trim().length === 0) {
        throw new Error("Query string is required and cannot be empty");
    }

    const cleanTopK = Math.max(1, Math.min(10, parseInt(topK, 10) || 5));
    const queryVector = await embedText(query.trim());

    const results = await searchSimilarChunks(queryVector, cleanTopK);
    return results;
}

module.exports = {
    retrieveRelevantKnowledge
};
