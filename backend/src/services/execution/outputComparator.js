/**
 * Output Normalization and Comparison Module
 */

/**
 * Normalizes output string by converting CRLF to LF and trimming outer whitespace
 * @param {string} str - Raw output string
 * @returns {string} Normalized string
 */
const normalizeOutput = (str) => {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim();
};

/**
 * Deterministically compares actual stdout against expected test case output
 * @param {string} actual - Actual program stdout
 * @param {string} expected - Expected problem output
 * @returns {boolean} True if matching, false otherwise
 */
const compareOutputs = (actual, expected) => {
    return normalizeOutput(actual) === normalizeOutput(expected);
};

module.exports = {
    normalizeOutput,
    compareOutputs
};
