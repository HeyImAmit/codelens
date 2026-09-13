const { retrieveRelevantKnowledge } = require("./retrievalService");

const EVALUATION_DATASET = [
    {
        query: "find a pair of numbers in an array whose sum matches a target value",
        expectedProblemIds: [1],
        expectedTitle: "Two Sum"
    },
    {
        query: "check whether parentheses and brackets are properly opened and closed",
        expectedProblemIds: [2],
        expectedTitle: "Valid Parentheses"
    },
    {
        query: "find the contiguous subarray with the largest sum",
        expectedProblemIds: [5],
        expectedTitle: "Maximum Subarray"
    },
    {
        query: "longest substring that contains no duplicate characters",
        expectedProblemIds: [14],
        expectedTitle: "Longest Substring Without Repeating Characters"
    },
    {
        query: "efficiently find the index of a target value in a sorted array",
        expectedProblemIds: [16],
        expectedTitle: "Binary Search"
    },
    {
        query: "reverse the pointers of a singly linked list",
        expectedProblemIds: [19],
        expectedTitle: "Reverse Linked List"
    },
    {
        query: "determine the maximum depth or height of a binary tree",
        expectedProblemIds: [29],
        expectedTitle: "Maximum Depth of Binary Tree"
    },
    {
        query: "check whether a binary tree satisfies the binary search tree property",
        expectedProblemIds: [31],
        expectedTitle: "Validate Binary Search Tree"
    },
    {
        query: "find the kth largest element in an unsorted array using a heap",
        expectedProblemIds: [33],
        expectedTitle: "Kth Largest Element in an Array"
    },
    {
        query: "count the number of connected land components surrounded by water in a 2D grid",
        expectedProblemIds: [35],
        expectedTitle: "Number of Islands"
    },
    {
        query: "detect if there is a cycle in course prerequisites using topological sort",
        expectedProblemIds: [36],
        expectedTitle: "Course Schedule"
    },
    {
        query: "find the fewest number of coins needed to make up a given amount",
        expectedProblemIds: [40],
        expectedTitle: "Coin Change"
    },
    {
        query: "find the length of the longest strictly increasing subsequence in an array",
        expectedProblemIds: [41],
        expectedTitle: "Longest Increasing Subsequence"
    },
    {
        query: "find the element that appears once where all other elements appear twice",
        expectedProblemIds: [43],
        expectedTitle: "Single Number"
    },
    {
        query: "calculate the number of unique paths from the top-left to bottom-right in a grid",
        expectedProblemIds: [49],
        expectedTitle: "Unique Paths"
    }
];

/**
 * Evaluates semantic retrieval quality using Recall@K.
 *
 * @param {Array<Object>} [dataset] - Custom evaluation dataset
 * @returns {Promise<Object>} Evaluation results and metrics
 */
async function evaluateRetrieval(dataset = EVALUATION_DATASET) {
    console.log(`=== RUNNING RAG RETRIEVAL EVALUATION (${dataset.length} queries) ===\n`);

    let hitsAt1 = 0;
    let hitsAt3 = 0;
    let hitsAt5 = 0;

    const queryResults = [];

    for (let i = 0; i < dataset.length; i++) {
        const item = dataset[i];
        const retrieved = await retrieveRelevantKnowledge(item.query, 5);
        const retrievedIds = retrieved.map(r => r.problemId);

        const hit1 = item.expectedProblemIds.includes(retrievedIds[0]);
        const hit3 = retrievedIds.slice(0, 3).some(id => item.expectedProblemIds.includes(id));
        const hit5 = retrievedIds.slice(0, 5).some(id => item.expectedProblemIds.includes(id));

        if (hit1) hitsAt1++;
        if (hit3) hitsAt3++;
        if (hit5) hitsAt5++;

        const top1Title = retrieved[0]?.title || "None";
        const top3Titles = retrieved.slice(0, 3).map(r => r.title).join(", ");

        console.log(`[Query ${i + 1}/${dataset.length}] "${item.query}"`);
        console.log(`  Expected: Problem #${item.expectedProblemIds.join(",")} (${item.expectedTitle})`);
        console.log(`  Top-1:    ${top1Title} (Score: ${retrieved[0]?.score ?? "N/A"}) -> ${hit1 ? "HIT" : "MISS"}`);
        console.log(`  Top-3:    [${top3Titles}] -> ${hit3 ? "HIT" : "MISS"}`);
        console.log(`  Top-5:    ${hit5 ? "HIT" : "MISS"}\n`);

        queryResults.push({
            query: item.query,
            expected: item.expectedTitle,
            expectedIds: item.expectedProblemIds,
            retrieved: retrieved.map(r => ({ id: r.problemId, title: r.title, score: r.score })),
            hitAt1: hit1,
            hitAt3: hit3,
            hitAt5: hit5
        });
    }

    const total = dataset.length;
    const recallAt1 = ((hitsAt1 / total) * 100).toFixed(2);
    const recallAt3 = ((hitsAt3 / total) * 100).toFixed(2);
    const recallAt5 = ((hitsAt5 / total) * 100).toFixed(2);

    console.log("=========================================");
    console.log("       RETRIEVAL EVALUATION SUMMARY      ");
    console.log("=========================================");
    console.log(`Queries Evaluated: ${total}`);
    console.log(`Recall@1:          ${recallAt1}% (${hitsAt1}/${total})`);
    console.log(`Recall@3:          ${recallAt3}% (${hitsAt3}/${total})`);
    console.log(`Recall@5:          ${recallAt5}% (${hitsAt5}/${total})`);
    console.log("=========================================\n");

    return {
        totalQueries: total,
        recallAt1: parseFloat(recallAt1),
        recallAt3: parseFloat(recallAt3),
        recallAt5: parseFloat(recallAt5),
        hitsAt1,
        hitsAt3,
        hitsAt5,
        details: queryResults
    };
}

module.exports = {
    evaluateRetrieval,
    EVALUATION_DATASET
};
