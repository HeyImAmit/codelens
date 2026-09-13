import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProblemById, createSubmission, getSubmissionById } from '../services/api';
import ProblemDescription from '../components/ProblemDescription';
import WorkspaceToolbar from '../components/WorkspaceToolbar';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';
import AITutorPanel from '../components/ai/AITutorPanel';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';
import { ArrowLeft, Terminal, Sparkles, SlidersHorizontal } from 'lucide-react';
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

  // Resizable Layout Split States
  const [leftWidthPercent, setLeftWidthPercent] = useState(42);
  const [bottomHeightPercent, setBottomHeightPercent] = useState(38);
  const [isDraggingCol, setIsDraggingCol] = useState(false);
  const [isDraggingRow, setIsDraggingRow] = useState(false);

  const layoutRef = useRef(null);
  const rightPaneRef = useRef(null);

  // Reset split proportions to default
  const resetHorizontalSplit = useCallback(() => setLeftWidthPercent(42), []);
  const resetVerticalSplit = useCallback(() => setBottomHeightPercent(38), []);
  const resetAllSplits = useCallback(() => {
    setLeftWidthPercent(42);
    setBottomHeightPercent(38);
  }, []);

  // Horizontal column dragging handlers (Problem vs Editor)
  const handleColPointerDown = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingCol(true);
  }, []);

  const handleColPointerMove = useCallback((e) => {
    if (!isDraggingCol || !layoutRef.current) return;
    const rect = layoutRef.current.getBoundingClientRect();
    const totalWidth = rect.width;
    if (totalWidth <= 0) return;

    const currentX = e.clientX - rect.left;
    const minLeftPx = 280;
    const minRightPx = 380;
    const clampedX = Math.max(minLeftPx, Math.min(totalWidth - minRightPx, currentX));
    const newPercent = (clampedX / totalWidth) * 100;
    setLeftWidthPercent(Math.max(20, Math.min(75, newPercent)));
  }, [isDraggingCol]);

  const handleColPointerUp = useCallback((e) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}
    setIsDraggingCol(false);
  }, []);

  // Vertical row dragging handlers (Editor vs Bottom Panel)
  const handleRowPointerDown = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingRow(true);
  }, []);

  const handleRowPointerMove = useCallback((e) => {
    if (!isDraggingRow || !rightPaneRef.current) return;
    const rect = rightPaneRef.current.getBoundingClientRect();
    const totalHeight = rect.height;
    if (totalHeight <= 0) return;

    const bottomPx = rect.bottom - e.clientY;
    const minTopPx = 180;
    const minBottomPx = 130;
    const clampedBottomPx = Math.max(minBottomPx, Math.min(totalHeight - minTopPx, bottomPx));
    const newPercent = (clampedBottomPx / totalHeight) * 100;
    setBottomHeightPercent(Math.max(18, Math.min(70, newPercent)));
  }, [isDraggingRow]);

  const handleRowPointerUp = useCallback((e) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}
    setIsDraggingRow(false);
  }, []);

  // Keyboard Accessibility for Column Divider
  const handleColKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setLeftWidthPercent((prev) => Math.max(20, prev - 2));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setLeftWidthPercent((prev) => Math.min(75, prev + 2));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setLeftWidthPercent(20);
    } else if (e.key === 'End') {
      e.preventDefault();
      setLeftWidthPercent(75);
    }
  }, []);

  // Keyboard Accessibility for Row Divider
  const handleRowKeyDown = useCallback((e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setBottomHeightPercent((prev) => Math.min(70, prev + 2));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setBottomHeightPercent((prev) => Math.max(18, prev - 2));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setBottomHeightPercent(18);
    } else if (e.key === 'End') {
      e.preventDefault();
      setBottomHeightPercent(70);
    }
  }, []);

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
        <div className="subnav-right">
          <button
            className="subnav-reset-layout-btn"
            onClick={resetAllSplits}
            title="Reset workspace split layout to defaults (Double click dividers to reset individually)"
            aria-label="Reset workspace split layout"
          >
            <SlidersHorizontal size={12} />
            <span>Reset Layout</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Split Layout */}
      <div
        ref={layoutRef}
        className={`workspace-main-layout ${isDraggingCol ? 'is-dragging-col' : ''} ${isDraggingRow ? 'is-dragging-row' : ''}`}
      >
        {/* Left Pane: Problem Description */}
        <div
          className="workspace-pane left-description-pane"
          style={{ width: `${leftWidthPercent}%` }}
        >
          <ProblemDescription problem={problem} />
        </div>

        {/* Horizontal Drag Handle (Column Divider) */}
        <div
          className={`workspace-divider-col ${isDraggingCol ? 'active' : ''}`}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize left problem description and right editor panes"
          aria-valuenow={Math.round(leftWidthPercent)}
          aria-valuemin={20}
          aria-valuemax={75}
          tabIndex={0}
          onPointerDown={handleColPointerDown}
          onPointerMove={handleColPointerMove}
          onPointerUp={handleColPointerUp}
          onPointerCancel={handleColPointerUp}
          onDoubleClick={resetHorizontalSplit}
          onKeyDown={handleColKeyDown}
          title="Drag left/right to resize columns (Double click to reset)"
        >
          <div className="divider-grip-col" />
        </div>

        {/* Right Pane: Editor & Output/Analysis */}
        <div
          ref={rightPaneRef}
          className="workspace-pane right-editor-pane"
          style={{ width: `calc(100% - ${leftWidthPercent}% - 6px)` }}
        >
          {/* Top Section: Editor Container */}
          <div
            className="editor-panel-box"
            style={{ height: `calc(100% - ${bottomHeightPercent}% - 6px)` }}
          >
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

          {/* Vertical Drag Handle (Row Divider) */}
          <div
            className={`workspace-divider-row ${isDraggingRow ? 'active' : ''}`}
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize top editor and bottom output/AI panels"
            aria-valuenow={Math.round(bottomHeightPercent)}
            aria-valuemin={18}
            aria-valuemax={70}
            tabIndex={0}
            onPointerDown={handleRowPointerDown}
            onPointerMove={handleRowPointerMove}
            onPointerUp={handleRowPointerUp}
            onPointerCancel={handleRowPointerUp}
            onDoubleClick={resetVerticalSplit}
            onKeyDown={handleRowKeyDown}
            title="Drag up/down to resize bottom panel (Double click to reset)"
          >
            <div className="divider-grip-row" />
          </div>

          {/* Bottom Section: Tabbed Output / CodeLens Analysis */}
          <div
            className="bottom-panel-box"
            style={{ height: `${bottomHeightPercent}%` }}
          >
            {/* Bottom Tab Switcher */}
            <div className="bottom-panel-nav">
              <button
                className={`bottom-tab-btn ${bottomTab === 'output' ? 'active' : ''}`}
                onClick={() => setBottomTab('output')}
                aria-label="View execution test output"
              >
                <Terminal size={13} />
                <span>Execution Output</span>
              </button>
              <button
                className={`bottom-tab-btn ${bottomTab === 'ai' || bottomTab === 'analysis' ? 'active' : ''}`}
                onClick={() => setBottomTab('ai')}
                aria-label="View CodeLens AI features"
              >
                <Sparkles size={13} />
                <span>CodeLens AI</span>
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
                <AITutorPanel
                  key={problem?.id || id}
                  problem={problem}
                  problemId={problem?.id || id}
                  language={language}
                  sourceCode={codeByLanguage[language]}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
