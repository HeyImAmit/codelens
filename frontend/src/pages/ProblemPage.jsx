import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProblemById, createSubmission } from '../services/api';
import ProblemDescription from '../components/ProblemDescription';
import WorkspaceToolbar from '../components/WorkspaceToolbar';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';
import { ArrowLeft, Play, Send, RefreshCw, AlertCircle } from 'lucide-react';
import './ProblemPage.css';

// Default starter templates
const DEFAULT_STARTER_CODES = {
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        
    }
}`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    
    return 0;
}`,
  python: `def main():
    pass

if __name__ == "__main__":
    main()`,
};

export default function ProblemPage() {
  const { id } = useParams();

  // Problem Fetch States
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editor States
  const [language, setLanguage] = useState('java');
  const [codeByLanguage, setCodeByLanguage] = useState(DEFAULT_STARTER_CODES);

  // Execution & Submission States
  const [executionState, setExecutionState] = useState('idle'); // 'idle' | 'running' | 'submitting' | 'submitted' | 'error'
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  // Load problem details from API
  const fetchProblem = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProblemById(id);
      setProblem(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProblem();
  }, [fetchProblem]);

  // Code change handler for current language
  const handleCodeChange = (newCode) => {
    setCodeByLanguage((prev) => ({
      ...prev,
      [language]: newCode,
    }));
  };

  // Reset code handler for current language
  const handleResetCode = () => {
    setCodeByLanguage((prev) => ({
      ...prev,
      [language]: DEFAULT_STARTER_CODES[language],
    }));
    setExecutionState('idle');
    setSubmissionResult(null);
    setSubmissionError(null);
  };

  // Run button handler
  const handleRunCode = () => {
    setExecutionState('running');
    setSubmissionResult(null);
    setSubmissionError(null);
  };

  // Submit button handler (calls POST /api/submissions)
  const handleSubmitCode = async () => {
    if (!problem) return;
    setExecutionState('submitting');
    setSubmissionError(null);
    setSubmissionResult(null);

    const currentCode = codeByLanguage[language];

    try {
      const result = await createSubmission({
        problemId: problem.id,
        language: language,
        sourceCode: currentCode,
      });

      setSubmissionResult(result);
      setExecutionState('submitted');
    } catch (err) {
      setSubmissionError(err);
      setExecutionState('error');
    }
  };

  // Loading View
  if (loading) {
    return (
      <div className="problem-workspace-page">
        <div className="container workspace-loading-container">
          <SkeletonLoader count={2} />
        </div>
      </div>
    );
  }

  // Error View
  if (error) {
    return (
      <div className="problem-workspace-page">
        <div className="container workspace-error-container">
          <Link to="/problems" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to Problems</span>
          </Link>
          <ErrorState error={error} onRetry={fetchProblem} />
        </div>
      </div>
    );
  }

  return (
    <div className="problem-workspace-page">
      {/* Workspace Grid Layout */}
      <div className="workspace-main-container">
        {/* Left Pane: Problem Description */}
        <div className="workspace-pane left-pane">
          <ProblemDescription problem={problem} />
        </div>

        {/* Right Pane: Editor & Output */}
        <div className="workspace-pane right-pane">
          {/* Editor Top Section */}
          <div className="editor-container glass-panel">
            <WorkspaceToolbar
              language={language}
              onLanguageChange={setLanguage}
              onResetCode={handleResetCode}
            />
            <div className="editor-body">
              <CodeEditor
                language={language}
                code={codeByLanguage[language]}
                onChange={handleCodeChange}
              />
            </div>
          </div>

          {/* Bottom Section: Output / Test Cases Panel */}
          <div className="output-container glass-panel">
            <OutputPanel
              executionState={executionState}
              submissionResult={submissionResult}
              error={submissionError}
            />
          </div>
        </div>
      </div>

      {/* Footer Navigation & Action Bar */}
      <footer className="workspace-footer glass-panel">
        <div className="footer-left">
          <Link to="/problems" className="footer-back-link">
            <ArrowLeft size={16} />
            <span>Back to Problems</span>
          </Link>
        </div>

        <div className="footer-actions">
          <button
            className="footer-btn run-btn"
            onClick={handleRunCode}
            disabled={executionState === 'submitting'}
          >
            <Play size={15} />
            <span>Run Code</span>
          </button>

          <button
            className="footer-btn submit-btn"
            onClick={handleSubmitCode}
            disabled={executionState === 'submitting'}
          >
            {executionState === 'submitting' ? (
              <RefreshCw size={15} className="spin-icon" />
            ) : (
              <Send size={15} />
            )}
            <span>{executionState === 'submitting' ? 'Submitting...' : 'Submit'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
