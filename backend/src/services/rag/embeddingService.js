const { pipeline } = require("@xenova/transformers");

const EMBEDDING_MODEL_NAME = "Xenova/all-MiniLM-L6-v2";
const EMBEDDING_DIMENSION = 384;

let pipelinePromise = null;

/**
 * Initializes and caches the local ONNX feature extraction pipeline.
 */
async function getEmbeddingPipeline() {
    if (!pipelinePromise) {
        pipelinePromise = pipeline("feature-extraction", EMBEDDING_MODEL_NAME, {
            quantized: true
        });
    }
    return pipelinePromise;
}

/**
 * Generates a normalized vector embedding for a single string.
 *
 * @param {string} text
 * @returns {Promise<Array<number>>} 384-dimensional float array
 */
async function embedText(text) {
    if (typeof text !== "string" || text.trim().length === 0) {
        throw new Error("Cannot generate embedding for empty text");
    }

    const extractor = await getEmbeddingPipeline();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
}

/**
 * Generates vector embeddings for a batch of strings.
 *
 * @param {Array<string>} texts
 * @returns {Promise<Array<Array<number>>>}
 */
async function embedBatch(texts) {
    if (!Array.isArray(texts) || texts.length === 0) {
        return [];
    }

    const embeddings = [];
    for (const text of texts) {
        const vec = await embedText(text);
        embeddings.push(vec);
    }
    return embeddings;
}

module.exports = {
    embedText,
    embedBatch,
    getEmbeddingPipeline,
    EMBEDDING_MODEL_NAME,
    EMBEDDING_DIMENSION
};
