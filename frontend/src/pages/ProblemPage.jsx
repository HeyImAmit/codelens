import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProblemById, createSubmission, getSubmissionById } from '../services/api';
import ProblemDescription from '../components/ProblemDescription';
import WorkspaceToolbar from '../components/WorkspaceToolbar';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';
import CodeLensAnalysisPanel from '../components/CodeLensAnalysisPanel';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';
import { ArrowLeft, Terminal, Sparkles } from 'lucide-react';
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

  // Bottom Workspace Tab: 'output' | 'analysis'
  const [bottomTab, setBottomTab] = useState('output');

  // Execution & Polling States
  // 'idle' | 'running' | 'polling' | 'terminal' | 'error'
  const [executionState, setExecutionState] = useState('idle');
  const [executionMode, setExecutionMode] = useState('submit'); // 'run' | 'submit'
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  // Refs for tracking active polling to prevent memory leaks across unmounts/navigation
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
    setIsExecuting(false);
    setCodeByLanguage((prev) => ({
      ...prev,
      [language]: DEFAULT_STARTER_CODES[language],
    }));
    setExecutionState('idle');
    setSubmissionResult(null);
    setSubmissionError(null);
  };

  // Polling Engine
  const startPolling = useCallback(
    (submissionId) => {
      clearPollingTimer();
      activeSubmissionIdRef.current = submissionId;
      setIsPolling(true);
      consecutiveFailuresRef.current = 0;

      const poll = async () => {
        if (activeSubmissionIdRef.current !== submissionId) {
          return;
        }

        try {
          const updatedSubmission = await getSubmissionById(submissionId);

          if (activeSubmissionIdRef.current !== submissionId) {
            return;
          }

          consecutiveFailuresRef.current = 0;
          setSubmissionResult(updatedSubmission);

          const status = (updatedSubmission?.status || '').toUpperCase();

          if (TERMINAL_STATUSES.has(status)) {
            // Finished
            setIsPolling(false);
            setIsExecuting(false);
            setExecutionState('terminal');
            activeSubmissionIdRef.current = null;
          } else {
            // Still in progress
            setExecutionState('polling');
            pollingTimerRef.current = setTimeout(poll, POLLING_INTERVAL_MS);
          }
        } catch (err) {
          if (activeSubmissionIdRef.current !== submissionId) {
            return;
          }

          consecutiveFailuresRef.current += 1;
          console.error(`Polling error for submission #${submissionId}:`, err);

          if (consecutiveFailuresRef.current >= 5) {
            setIsPolling(false);
            setIsExecuting(false);
            setExecutionState('error');
            setSubmissionError(
              new Error('Lost connection while polling execution status. Please check backend connection.')
            );
            activeSubmissionIdRef.current = null;
          } else {
            pollingTimerRef.current = setTimeout(poll, POLLING_INTERVAL_MS);
          }
        }
      };

      pollingTimerRef.current = setTimeout(poll, POLLING_INTERVAL_MS);
    },
    [clearPollingTimer]
  );

  // Common Execution Trigger (handles both 'run' and 'submit' flows)
  const triggerExecution = async (mode) => {
    if (!problem || isExecuting || isPolling) return;

    clearPollingTimer();
    setExecutionMode(mode);
    setIsExecuting(true);
    setIsPolling(false);
    setExecutionState('running');
    setSubmissionError(null);
    setSubmissionResult(null);
    setBottomTab('output'); // Auto switch to output tab on execution

    const currentCode = codeByLanguage[language];

    try {
      const initialSubmission = await createSubmission({
        problemId: problem.id,
        language: language,
        sourceCode: currentCode,
      });

      setSubmissionResult(initialSubmission);

      const status = (initialSubmission?.status || '').toUpperCase();

      if (TERMINAL_STATUSES.has(status)) {
        setIsExecuting(false);
        setExecutionState('terminal');
      } else {
        setExecutionState('polling');
        startPolling(initialSubmission.id);
      }
    } catch (err) {
      setIsExecuting(false);
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
            <ArrowLeft size={15} />
            <span>Back to Problems</span>
          </Link>
          <ErrorState error={error} onRetry={fetchProblem} />
        </div>
      </div>
    );
  }

  return (
    <div className="problem-workspace-page">
      {/* Top Breadcrumb Header */}
      <header className="workspace-subnav">
        <div className="subnav-left">
          <Link to="/problems" className="back-nav-btn" title="Back to problem catalog">
            <ArrowLeft size={14} />
            <span>Problems</span>
          </Link>
          <span className="subnav-divider">/</span>
          <span className="subnav-title">{problem.title}</span>
        </div>
      </header>

      {/* Main Workspace Split Layout */}
      <div className="workspace-main-layout">
        {/* Left Pane: Problem Description */}
        <div className="workspace-pane left-description-pane">
          <ProblemDescription problem={problem} />
        </div>

        {/* Right Pane: Editor & Output/Analysis */}
        <div className="workspace-pane right-editor-pane">
          {/* Top Section: Editor Container */}
          <div className="editor-panel-box">
            <WorkspaceToolbar
              language={language}
              onLanguageChange={setLanguage}
              onResetCode={handleResetCode}
              onRunCode={() => triggerExecution('run')}
              onSubmitCode={() => triggerExecution('submit')}
              isExecuting={isExecuting || isPolling}
              executionMode={executionMode}
              lastVerdict={submissionResult?.status}
            />
            <div className="editor-panel-body">
              <CodeEditor
                language={language}
                code={codeByLanguage[language]}
                onChange={handleCodeChange}
              />
            </div>
          </div>

          {/* Bottom Section: Tabbed Output / CodeLens Analysis */}
          <div className="bottom-panel-box">
            {/* Bottom Tab Switcher */}
            <div className="bottom-panel-nav">
              <button
                className={`bottom-tab-btn ${bottomTab === 'output' ? 'active' : ''}`}
                onClick={() => setBottomTab('output')}
              >
                <Terminal size={13} />
                <span>Execution Output</span>
              </button>
              <button
                className={`bottom-tab-btn ${bottomTab === 'analysis' ? 'active' : ''}`}
                onClick={() => setBottomTab('analysis')}
              >
                <Sparkles size={13} />
                <span>CodeLens Analysis</span>
              </button>
            </div>

            {/* Bottom Panel Views */}
            <div className="bottom-panel-content">
              {bottomTab === 'output' ? (
                <OutputPanel
                  executionState={executionState}
                  executionMode={executionMode}
                  submissionResult={submissionResult}
                  error={submissionError}
                  isPolling={isPolling}
                />
              ) : (
                <CodeLensAnalysisPanel
                  submissionResult={submissionResult}
                  isEvaluating={isPolling || executionState === 'running'}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
