import React, { useState } from 'react';
import {
  Terminal,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  Clock,
  RotateCw,
  Info,
  Play,
} from 'lucide-react';
import './OutputPanel.css';

const formatTime = (ms) => {
  if (ms === null || ms === undefined) return null;
  const num = Number(ms);
  if (isNaN(num)) return null;
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}s`;
  }
  return `${num} ms`;
};

export default function OutputPanel({
  executionState, // 'idle' | 'running' | 'polling' | 'terminal' | 'error'
  executionMode,  // 'run' | 'submit'
  submissionResult,
  error,
  isPolling,
}) {
  const [activeTab, setActiveTab] = useState('output'); // 'output' | 'testcases'

  const status = submissionResult?.status?.toUpperCase();

  // Status tag helper
  const renderStatusBadge = () => {
    if (executionState === 'idle') {
      return (
        <span className="status-badge idle">
          <Info size={11} />
          <span>Ready</span>
        </span>
      );
    }
    if (isPolling || executionState === 'running' || status === 'PENDING' || status === 'RUNNING') {
      return (
        <span className="status-badge running">
          <RotateCw size={11} className="spin-icon" />
          <span>{status === 'PENDING' ? 'Queued' : 'Executing...'}</span>
        </span>
      );
    }
    if (status === 'ACCEPTED') {
      return (
        <span className="status-badge accepted">
          <CheckCircle2 size={11} />
          <span>Passed</span>
        </span>
      );
    }
    if (status === 'WRONG_ANSWER') {
      return (
        <span className="status-badge wrong">
          <XCircle size={11} />
          <span>Wrong Answer</span>
        </span>
      );
    }
    if (status === 'COMPILATION_ERROR') {
      return (
        <span className="status-badge compile-error">
          <AlertTriangle size={11} />
          <span>Compilation Error</span>
        </span>
      );
    }
    if (status === 'RUNTIME_ERROR') {
      return (
        <span className="status-badge runtime-error">
          <AlertOctagon size={11} />
          <span>Runtime Error</span>
        </span>
      );
    }
    if (status === 'TIME_LIMIT_EXCEEDED') {
      return (
        <span className="status-badge timeout">
          <Clock size={11} />
          <span>Time Limit Exceeded</span>
        </span>
      );
    }
    if (executionState === 'error') {
      return (
        <span className="status-badge error">
          <XCircle size={11} />
          <span>Error</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="output-panel">
      {/* Header Bar */}
      <div className="output-tabs-header">
        <div className="tabs-list">
          <button
            className={`tab-item ${activeTab === 'output' ? 'active' : ''}`}
            onClick={() => setActiveTab('output')}
          >
            <Terminal size={13} />
            <span>Output</span>
            {status === 'ACCEPTED' && <span className="indicator-dot green" />}
            {(status === 'WRONG_ANSWER' || status === 'RUNTIME_ERROR' || status === 'COMPILATION_ERROR') && (
              <span className="indicator-dot red" />
            )}
          </button>
          <button
            className={`tab-item ${activeTab === 'testcases' ? 'active' : ''}`}
            onClick={() => setActiveTab('testcases')}
          >
            <Cpu size={13} />
            <span>Test Cases</span>
          </button>
        </div>

        {/* Right Header Status Info */}
        <div className="header-status-info">
          {submissionResult?.id && (
            <span className="submission-id-tag">
              #{submissionResult.id}
            </span>
          )}
          {submissionResult?.execution_time !== null && submissionResult?.execution_time !== undefined && (
            <span className="exec-time-tag">
              {formatTime(submissionResult.execution_time)}
            </span>
          )}
          {renderStatusBadge()}
        </div>
      </div>

      {/* Body Area */}
      <div className="output-panel-body">
        {activeTab === 'output' && (
          <div className="console-view">
            {/* 1. Idle State */}
            {executionState === 'idle' && (
              <div className="empty-console-state">
                <Play size={16} className="empty-state-icon" />
                <p>Click <strong>Run Code</strong> to execute or <strong>Submit</strong> for test-case evaluation.</p>
              </div>
            )}

            {/* 2. Evaluating / Polling State */}
            {(isPolling || executionState === 'running' || status === 'PENDING' || status === 'RUNNING') && (
              <div className="evaluating-state-banner">
                <div className="evaluating-spinner-wrapper">
                  <div className="spinner-small" />
                </div>
                <div className="evaluating-text-group">
                  <strong>
                    {status === 'PENDING'
                      ? 'Queued in RabbitMQ'
                      : 'Running inside Docker sandbox'}
                  </strong>
                  <p>Compiling Java source and executing test suite...</p>
                </div>
              </div>
            )}

            {/* 3. Terminal Execution Results */}
            {submissionResult && !isPolling && status !== 'PENDING' && status !== 'RUNNING' && (
              <div className="execution-result-container">
                {/* Result Summary Bar */}
                <div className={`result-summary-bar ${status?.toLowerCase()}`}>
                  <div className="summary-left">
                    {status === 'ACCEPTED' && <CheckCircle2 size={16} className="result-icon green" />}
                    {status === 'WRONG_ANSWER' && <XCircle size={16} className="result-icon red" />}
                    {status === 'COMPILATION_ERROR' && <AlertTriangle size={16} className="result-icon amber" />}
                    {status === 'RUNTIME_ERROR' && <AlertOctagon size={16} className="result-icon red" />}
                    {status === 'TIME_LIMIT_EXCEEDED' && <Clock size={16} className="result-icon orange" />}

                    <span className="summary-verdict-text">
                      {status === 'ACCEPTED' && 'Accepted — All Test Cases Passed'}
                      {status === 'WRONG_ANSWER' && 'Wrong Answer — Output Mismatch'}
                      {status === 'COMPILATION_ERROR' && 'Compilation Error'}
                      {status === 'RUNTIME_ERROR' && 'Runtime Exception'}
                      {status === 'TIME_LIMIT_EXCEEDED' && 'Time Limit Exceeded (> 5.0s)'}
                    </span>
                  </div>
                  {submissionResult.execution_time && (
                    <span className="summary-time">
                      {formatTime(submissionResult.execution_time)}
                    </span>
                  )}
                </div>

                {/* Accepted Output Message */}
                {status === 'ACCEPTED' && (
                  <div className="output-section">
                    <p className="clean-output-msg">
                      {submissionResult.output || 'All configured test cases passed successfully.'}
                    </p>
                  </div>
                )}

                {/* Compiler / Diagnostics Block */}
                {submissionResult.error && (
                  <div className="output-section">
                    <div className="section-title-label">Diagnostic Output:</div>
                    <pre className="monospace-output-box error-style">
                      {submissionResult.error}
                    </pre>
                  </div>
                )}

                {/* Standard Output (if any) */}
                {submissionResult.output && status !== 'ACCEPTED' && (
                  <div className="output-section">
                    <div className="section-title-label">Standard Output:</div>
                    <pre className="monospace-output-box stdout-style">
                      {submissionResult.output}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* 4. Network / Transport Error */}
            {executionState === 'error' && (
              <div className="network-error-banner">
                <AlertOctagon size={16} className="error-icon" />
                <div>
                  <strong>Submission Failed</strong>
                  <p>{error?.message || 'Unable to connect to backend service.'}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Test Cases Tab */}
        {activeTab === 'testcases' && (
          <div className="testcases-view">
            <div className="testcase-card">
              <span className="testcase-id-label">Test Case 1</span>
              <div className="testcase-row">
                <span className="case-dim-label">Input:</span>
                <code>4 9 \n 2 7 11 15</code>
              </div>
              <div className="testcase-row">
                <span className="case-dim-label">Expected Output:</span>
                <code>0 1</code>
              </div>
            </div>

            <div className="testcase-card">
              <span className="testcase-id-label">Test Case 2</span>
              <div className="testcase-row">
                <span className="case-dim-label">Input:</span>
                <code>3 6 \n 3 2 4</code>
              </div>
              <div className="testcase-row">
                <span className="case-dim-label">Expected Output:</span>
                <code>1 2</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
