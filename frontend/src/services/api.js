/**
 * CodeLens API Abstraction Service
 * Connects frontend client to Express backend on localhost:5000
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Normalizes problem difficulty formatting
 */
export const normalizeDifficulty = (diff) => {
  if (!diff) return 'Easy';
  const lower = String(diff).trim().toLowerCase();
  if (lower === 'easy') return 'Easy';
  if (lower === 'medium') return 'Medium';
  if (lower === 'hard') return 'Hard';
  return diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase();
};

/**
 * Fetches all problems from backend GET /api/problems
 */
export const getProblems = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/problems`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    
    // Ensure data is array and normalize entries
    if (!Array.isArray(data)) {
      throw new Error('Invalid problems data format received from server');
    }

    return data.map((problem) => ({
      ...problem,
      id: problem.id || problem.problem_id,
      difficulty: normalizeDifficulty(problem.difficulty),
    }));
  } catch (error) {
    console.error('API Error [getProblems]:', error);
    throw error;
  }
};

/**
 * Fetches a single problem by ID from backend GET /api/problems/:id
 */
export const getProblemById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/problems/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Problem not found');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch problem #${id}`);
    }

    const problem = await response.json();
    return {
      ...problem,
      id: problem.id || problem.problem_id,
      difficulty: normalizeDifficulty(problem.difficulty),
    };
  } catch (error) {
    console.error(`API Error [getProblemById ${id}]:`, error);
    throw error;
  }
};

/**
 * Creates a new problem submission POST /api/submissions
 * @param {Object} payload - { problemId, language, sourceCode }
 */
export const createSubmission = async ({ problemId, language, sourceCode }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        problemId: Number(problemId),
        language: String(language).toLowerCase(),
        sourceCode: String(sourceCode),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Submission failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error [createSubmission]:', error);
    throw error;
  }
};

/**
 * Fetches submission record and judging status by ID GET /api/submissions/:id
 * @param {number|string} id - Submission ID
 */
export const getSubmissionById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Submission not found');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch submission #${id}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [getSubmissionById ${id}]:`, error);
    throw error;
  }
};

/**
 * Sends a question to the grounded RAG AI Tutor POST /api/ai/ask
 * @param {Object} payload - { query, topK }
 */
export const askTutor = async ({ query, topK = 3 }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: String(query).trim(),
        topK: Number(topK) || 3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 400) {
        throw new Error(errorData.message || 'Please enter a valid question for the tutor.');
      } else if (response.status === 404) {
        throw new Error(errorData.message || 'The requested resource could not be found.');
      } else if (response.status === 429) {
        throw new Error('AI rate limit reached. Please wait a moment before asking again.');
      } else if (response.status >= 500) {
        throw new Error(errorData.message || 'AI Tutor service is temporarily unavailable. Please try again.');
      }
      throw new Error(errorData.message || `AI Tutor request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error [askTutor]:', error);
    throw error;
  }
};

/**
 * Requests an AI code review for the current submission POST /api/ai/review
 * @param {Object} payload - { problemId, language, sourceCode }
 */
export const reviewCode = async ({ problemId, language, sourceCode }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        problemId: Number(problemId),
        language: String(language).toLowerCase(),
        sourceCode: String(sourceCode),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 400) {
        throw new Error(errorData.message || 'Invalid code review request parameters.');
      } else if (response.status === 404) {
        throw new Error(errorData.message || 'The selected problem could not be found.');
      } else if (response.status === 429) {
        throw new Error('AI rate limit reached. Please wait a moment before requesting another review.');
      } else if (response.status >= 500) {
        throw new Error(errorData.message || 'AI Code Review service is temporarily unavailable.');
      }
      throw new Error(errorData.message || `Code review failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error [reviewCode]:', error);
    throw error;
  }
};

/**
 * Requests a progressive AI hint for the selected problem POST /api/ai/hint
 * @param {Object} payload - { problemId, level, sourceCode, previousHints }
 */
export const generateHint = async ({ problemId, level, sourceCode = null, previousHints = [] }) => {
  try {
    const bodyPayload = {
      problemId: Number(problemId),
      level: Number(level),
    };

    if (sourceCode && typeof sourceCode === 'string' && sourceCode.trim().length > 0) {
      bodyPayload.sourceCode = sourceCode;
    }

    if (Array.isArray(previousHints) && previousHints.length > 0) {
      bodyPayload.previousHints = previousHints;
    }

    const response = await fetch(`${API_BASE_URL}/ai/hint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 400) {
        throw new Error(errorData.message || 'Invalid hint request parameters.');
      } else if (response.status === 404) {
        throw new Error(errorData.message || 'The selected problem could not be found.');
      } else if (response.status === 429) {
        throw new Error('AI rate limit reached. Please wait a moment before generating another hint.');
      } else if (response.status >= 500) {
        throw new Error(errorData.message || 'AI Hint service is temporarily unavailable.');
      }
      throw new Error(errorData.message || `Hint generation failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error [generateHint]:', error);
    throw error;
  }
};
