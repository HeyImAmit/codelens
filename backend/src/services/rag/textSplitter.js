const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");

const DEFAULT_CHUNK_SIZE = 700;
const DEFAULT_CHUNK_OVERLAP = 100;

/**
 * Creates and returns a configured RecursiveCharacterTextSplitter.
 */
function createProblemTextSplitter(options = {}) {
    return new RecursiveCharacterTextSplitter({
        chunkSize: options.chunkSize || DEFAULT_CHUNK_SIZE,
        chunkOverlap: options.chunkOverlap || DEFAULT_CHUNK_OVERLAP,
        separators: ["\n\n", "\n", ". ", " ", ""]
    });
}

/**
 * Splits a single problem document into structured chunks with chunk indexing.
 *
 * @param {Document} document - LangChain Document
 * @param {Object} [options] - Splitter options
 * @returns {Promise<Array<{ content: string, metadata: Object, chunkIndex: number }>>}
 */
async function splitProblemDocument(document, options = {}) {
    const splitter = createProblemTextSplitter(options);
    const splitDocs = await splitter.splitDocuments([document]);

    return splitDocs.map((doc, idx) => ({
        content: doc.pageContent,
        chunkIndex: idx,
        metadata: {
            ...doc.metadata,
            chunkIndex: idx,
            totalChunks: splitDocs.length
        }
    }));
}

/**
 * Splits multiple problem documents.
 *
 * @param {Array<Document>} documents
 * @param {Object} [options]
 * @returns {Promise<Array<{ problemId: number, chunks: Array }>>}
 */
async function splitAllProblemDocuments(documents, options = {}) {
    const results = [];
    for (const doc of documents) {
        const chunks = await splitProblemDocument(doc, options);
        results.push({
            problemId: doc.metadata.problemId,
            chunks
        });
    }
    return results;
}

module.exports = {
    createProblemTextSplitter,
    splitProblemDocument,
    splitAllProblemDocuments,
    DEFAULT_CHUNK_SIZE,
    DEFAULT_CHUNK_OVERLAP
};
