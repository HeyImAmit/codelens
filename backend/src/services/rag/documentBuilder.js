const { Document } = require("@langchain/core/documents");

/**
 * Builds a structured LangChain Document from a PostgreSQL problem row.
 * Strictly excludes hidden test cases, source code, and submissions.
 *
 * @param {Object} problem - Problem database row
 * @returns {Document} Structured LangChain Document
 */
function buildProblemDocument(problem) {
    if (!problem || !problem.id || !problem.title) {
        throw new Error("Invalid problem data provided for document construction");
    }

    const sections = [
        `Problem: ${problem.title}`,
        `Topic: ${problem.topic || "General"}`,
        `Difficulty: ${problem.difficulty || "Medium"}`,
        `\nDescription:\n${(problem.description || "").trim()}`
    ];

    if (problem.input_format && problem.input_format.trim()) {
        sections.push(`\nInput Format:\n${problem.input_format.trim()}`);
    }

    if (problem.output_format && problem.output_format.trim()) {
        sections.push(`\nOutput Format:\n${problem.output_format.trim()}`);
    }

    if (problem.constraints && problem.constraints.trim()) {
        sections.push(`\nConstraints:\n${problem.constraints.trim()}`);
    }

    const timeComp = problem.expected_time_complexity || "Not specified";
    const spaceComp = problem.expected_space_complexity || "Not specified";
    sections.push(`\nExpected Complexity:\nTime: ${timeComp}\nSpace: ${spaceComp}`);

    const pageContent = sections.join("\n");

    const metadata = {
        problemId: problem.id,
        title: problem.title,
        topic: problem.topic || "General",
        difficulty: problem.difficulty || "Medium",
        expectedTimeComplexity: timeComp,
        expectedSpaceComplexity: spaceComp
    };

    return new Document({
        pageContent,
        metadata
    });
}

/**
 * Builds LangChain documents for an array of problems.
 *
 * @param {Array<Object>} problems
 * @returns {Array<Document>}
 */
function buildAllProblemDocuments(problems) {
    return (problems || []).map(buildProblemDocument);
}

module.exports = {
    buildProblemDocument,
    buildAllProblemDocuments
};
