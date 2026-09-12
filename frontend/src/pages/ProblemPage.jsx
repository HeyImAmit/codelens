import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProblemById, createSubmission, getSubmissionById } from '../services/api';
import ProblemDescription from '../components/ProblemDescription';
import WorkspaceToolbar from '../components/WorkspaceToolbar';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';
import { ArrowLeft, Play, Send, RefreshCw } from 'lucide-react';
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

// Terminal statuses that signal execution is finished
const TERMINAL_STATUSES = new Set([
  'ACCEPTED',
  'WRONG_ANSWER',
  'COMPILATION_ERROR',
  'RUNTIME_ERROR',
  'TIME_LIMIT_EXCEEDED',
]);

const POLLING_INTERVAL_MS = 1200;

export default function ProblemPage() {
  const { id } = useParams();

  // Problem Fetch States
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editor States
  const [language, setLanguage] = useState('java');
  const [codeByLanguage, setCodeByLanguage] = useState(DEFAULT_STARTER_CODES);

  // Execution & Polling States
  // 'idle' | 'running_notice' | 'submitting' | 'polling' | 'terminal' | 'error'
  const [executionState, setExecutionState] = useState('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  // Refs for tracking active polling to prevent leaks across unmounts/navigation
  const pollingTimerRef = useRef(null);
  const activeSubmissionIdRef = useRef(null);
  const consecutiveFailuresRef = useRef(0);

  // Helper to safely clear any active polling timer
  const clearPollingTimer = useCallback(() => {
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, []);

  // Cleanup polling timer when unmounting or changing problems
  useEffect(() => {
    return () => {
      clearPollingTimer();
      activeSubmissionIdRef.current = null;
    };
  }, [clearPollingTimer, id]);

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
    clearPollingTimer();
    activeSubmissionIdRef.current = null;
    setIsPolling(false);
    setIsSubmitting(false);
    setCodeByLanguage((prev) => ({
      ...prev,
      [language]: DEFAULT_STARTER_CODES[language],
    }));
    setExecutionState('idle');
    setSubmissionResult(null);
    setSubmissionError(null);
  };

  // Run button handler (Shows execution notice)
  const handleRunCode = () => {
    clearPollingTimer();
    activeSubmissionIdRef.current = null;
    setIsPolling(false);
    setExecutionState('running_notice');
    setSubmissionResult(null);
    setSubmissionError(null);
  };

  // Recursive Polling Logic
  const startPolling = useCallback(
    (submissionId) => {
      clearPollingTimer();
      activeSubmissionIdRef.current = submissionId;
      setIsPolling(true);
      consecutiveFailuresRef.current = 0;

      const poll = async () => {
        // If the active submission has changed or cleared, bail out
        if (activeSubmissionIdRef.current !== submissionId) {
          return;
        }

        try {
          const updatedSubmission = await getSubmissionById(submissionId);

          // Verify again before setting state
          if (activeSubmissionIdRef.current !== submissionId) {
            return;
          }

          consecutiveFailuresRef.current = 0;
          setSubmissionResult(updatedSubmission);

          const status = (updatedSubmission?.status || '').toUpperCase();

          if (TERMINAL_STATUSES.has(status)) {
            // Reached final state
            setIsPolling(false);
            setExecutionState('terminal');
            activeSubmissionIdRef.current = null;
          } else {
            // Still PENDING or RUNNING -> schedule next poll
            setExecutionState('polling');
            pollingTimerRef.current = setTimeout(poll, POLLING_INTERVAL_MS);
          }
        } catch (err) {
          if (activeSubmissionIdRef.current !== submissionId) {
            return;
          }

          consecutiveFailuresRef.current += 1;
          console.error(`Polling error for submission #${submissionId}:`, err);

          // If failed 5 times in a row, treat as error
          if (consecutiveFailuresRef.current >= 5) {
            setIsPolling(false);
            setExecutionState('error');
            setSubmissionError(
              new Error('Lost connection while polling submission status. Please check backend status.')
            );
            activeSubmissionIdRef.current = null;
          } else {
            // Retry polling after standard interval
            pollingTimerRef.current = setTimeout(poll, POLLING_INTERVAL_MS);
          }
        }
      };

      // Kick off the first poll after interval
      pollingTimerRef.current = setTimeout(poll, POLLING_INTERVAL_MS);
    },
    [clearPollingTimer]
  );

  // Submit button handler (calls POST /api/submissions -> triggers polling)
  const handleSubmitCode = async () => {
    if (!problem || isSubmitting || isPolling) return;

    clearPollingTimer();
    setIsSubmitting(true);
    setIsPolling(false);
    setExecutionState('submitting');
    setSubmissionError(null);
    setSubmissionResult(null);

    const currentCode = codeByLanguage[language];

    try {
      const initialSubmission = await createSubmission({
        problemId: problem.id,
        language: language,
        sourceCode: currentCode,
      });

      setSubmissionResult(initialSubmission);
      setIsSubmitting(false);

      const status = (initialSubmission?.status || '').toUpperCase();

      if (TERMINAL_STATUSES.has(status)) {
        setExecutionState('terminal');
      } else {
        // Start polling for PENDING or RUNNING status
        setExecutionState('polling');
        startPolling(initialSubmission.id);
      }
    } catch (err) {
      setIsSubmitting(false);
      setIsPolling(false);
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

  const isActionDisabled = isSubmitting || isPolling;

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
              isPolling={isPolling}
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
            disabled={isActionDisabled}
          >
            <Play size={15} />
            <span>Run Code</span>
          </button>

          <button
            className="footer-btn submit-btn"
            onClick={handleSubmitCode}
            disabled={isActionDisabled}
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={15} className="spin-icon" />
                <span>Submitting...</span>
              </>
            ) : isPolling ? (
              <>
                <RefreshCw size={15} className="spin-icon" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>Submit</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
