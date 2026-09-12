import React, { useState } from 'react';
import {
  Terminal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Info,
  ShieldAlert,
  Cpu,
  Sparkles,
  Play,
  RotateCw,
} from 'lucide-react';
import './OutputPanel.css';

/**
 * Format execution time nicely in seconds / milliseconds
 */
const formatTime = (ms) => {
  if (ms === null || ms === undefined) return null;
  const num = Number(ms);
  if (isNaN(num)) return null;
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}s (${num} ms)`;
  }
  return `${num} ms`;
};

export default function OutputPanel({
  executionState, // 'idle' | 'running_notice' | 'submitting' | 'polling' | 'terminal' | 'error'
  submissionResult,
  error,
  isPolling,
}) {
  const [activeTab, setActiveTab] = useState('output'); // 'output' | 'testcases'

  const status = submissionResult?.status?.toUpperCase();

  // Pick tab status badge metadata
  const getStatusBadge = () => {
    if (executionState === 'idle') {
      return (
        <span className="status-tag idle">
          <Info size={12} /> Ready
        </span>
      );
    }
    if (executionState === 'running_notice') {
      return (
        <span className="status-tag info">
          <Sparkles size={12} /> Execution Notice
        </span>
      );
    }
    if (executionState === 'submitting') {
      return (
        <span className="status-tag submitting">
          <RotateCw size={12} className="spin-icon" /> Submitting...
        </span>
      );
    }
    if (status === 'PENDING') {
      return (
        <span className="status-tag pending">
          <span className="pulse-dot amber" /> Queued
        </span>
      );
    }
    if (status === 'RUNNING') {
      return (
        <span className="status-tag running">
          <RotateCw size={12} className="spin-icon" /> Running
        </span>
      );
    }
    if (status === 'ACCEPTED') {
      return (
        <span className="status-tag accepted">
          <CheckCircle2 size={12} /> Accepted
        </span>
      );
    }
    if (status === 'WRONG_ANSWER') {
      return (
        <span className="status-tag wrong">
          <XCircle size={12} /> Wrong Answer
        </span>
      );
    }
    if (status === 'COMPILATION_ERROR') {
      return (
        <span className="status-tag compile-error">
          <AlertTriangle size={12} /> Compilation Error
        </span>
      );
    }
    if (status === 'RUNTIME_ERROR') {
      return (
        <span className="status-tag runtime-error">
          <AlertOctagon size={12} /> Runtime Error
        </span>
      );
    }
    if (status === 'TIME_LIMIT_EXCEEDED') {
      return (
        <span className="status-tag timeout">
          <Clock size={12} /> Time Limit Exceeded
        </span>
      );
    }
    if (executionState === 'error') {
      return (
        <span className="status-tag error">
          <ShieldAlert size={12} /> Error
        </span>
      );
    }
    return null;
  };

  return (
    <div className="output-panel">
      {/* Tab Navigation Header */}
      <div className="output-tabs-header">
        <div className="tabs-group">
          <button
            className={`tab-btn ${activeTab === 'output' ? 'active' : ''}`}
            onClick={() => setActiveTab('output')}
          >
            <Terminal size={14} />
            <span>Output</span>
            {status === 'ACCEPTED' && <span className="tab-dot green" />}
            {(status === 'WRONG_ANSWER' || status === 'RUNTIME_ERROR' || status === 'COMPILATION_ERROR') && (
              <span className="tab-dot red" />
            )}
            {(status === 'PENDING' || status === 'RUNNING') && <span className="tab-dot amber" />}
          </button>
          <button
            className={`tab-btn ${activeTab === 'testcases' ? 'active' : ''}`}
            onClick={() => setActiveTab('testcases')}
          >
            <Cpu size={14} />
            <span>Test Cases</span>
          </button>
        </div>

        {/* Live Status Indicator Pill */}
        <div className="panel-status-indicator">{getStatusBadge()}</div>
      </div>

      {/* Tab Content Body */}
      <div className="output-body">
        {activeTab === 'output' && (
          <div className="output-console">
            {/* 1. IDLE STATE */}
            {executionState === 'idle' && (
              <div className="console-message idle">
                <Play size={20} className="console-icon" />
                <p>Run your code or submit your solution to view evaluation output.</p>
              </div>
            )}

            {/* 2. RUN BUTTON NOTICE */}
            {executionState === 'running_notice' && (
              <div className="console-card info">
                <div className="console-card-header">
                  <Cpu size={18} className="card-icon" />
                  <h4>Execution Engine Notice</h4>
                </div>
                <div className="console-card-body">
                  <p className="primary-notice">
                    Run mode is dedicated for quick local checks. To test against all judging test cases in our Docker sandbox, click <strong>Submit</strong>.
                  </p>
                  <div className="notice-details">
                    <p>• Submissions are asynchronously compiled and evaluated inside Docker.</p>
                    <p>• Results are streamed back in real time.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SUBMITTING STATE */}
            {executionState === 'submitting' && (
              <div className="console-message submitting">
                <div className="spinner" />
                <p>Creating submission in PostgreSQL via <code>POST /api/submissions</code>...</p>
              </div>
            )}

            {/* 4. ASYNC SUBMISSION RESULT (QUEUED / RUNNING / TERMINAL) */}
            {submissionResult && executionState !== 'idle' && executionState !== 'running_notice' && executionState !== 'submitting' && (
              <div className={`console-card result-card ${status ? status.toLowerCase() : ''}`}>
                {/* Result Header */}
                <div className="console-card-header">
                  {status === 'ACCEPTED' && <CheckCircle2 size={20} className="card-icon green" />}
                  {status === 'WRONG_ANSWER' && <XCircle size={20} className="card-icon red" />}
                  {status === 'COMPILATION_ERROR' && <AlertTriangle size={20} className="card-icon orange" />}
                  {status === 'RUNTIME_ERROR' && <AlertOctagon size={20} className="card-icon red" />}
                  {status === 'TIME_LIMIT_EXCEEDED' && <Clock size={20} className="card-icon orange" />}
                  {(status === 'PENDING' || status === 'RUNNING') && (
                    <div className="spinner-small" />
                  )}

                  <div className="card-title-group">
                    <h4>
                      {status === 'ACCEPTED' && 'Accepted'}
                      {status === 'WRONG_ANSWER' && 'Wrong Answer'}
                      {status === 'COMPILATION_ERROR' && 'Compilation Error'}
                      {status === 'RUNTIME_ERROR' && 'Runtime Error'}
                      {status === 'TIME_LIMIT_EXCEEDED' && 'Time Limit Exceeded'}
                      {status === 'PENDING' && 'Queued'}
                      {status === 'RUNNING' && 'Running in Sandbox'}
                    </h4>
                    {isPolling && (
                      <span className="live-evaluating-pill">
                        <span className="pulse-dot green" />
                        Evaluating...
                      </span>
                    )}
                  </div>

                  <span className="submission-id-pill">
                    Submission #{submissionResult.id}
                  </span>
                </div>

                {/* Result Meta Bar */}
                <div className="submission-meta-grid">
                  <div className="meta-item">
                    <span className="meta-label">Status</span>
                    <span className={`meta-value ${status ? status.toLowerCase() : ''}`}>
                      {status === 'PENDING' ? 'QUEUED' : status}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Language</span>
                    <span className="meta-value code-font">
                      {submissionResult.language?.toUpperCase()}
                    </span>
                  </div>
                  {submissionResult.execution_time !== null && submissionResult.execution_time !== undefined && (
                    <div className="meta-item">
                      <span className="meta-label">Execution Time</span>
                      <span className="meta-value">
                        {formatTime(submissionResult.execution_time)}
                      </span>
                    </div>
                  )}
                  <div className="meta-item">
                    <span className="meta-label">Submitted</span>
                    <span className="meta-value">
                      {submissionResult.created_at
                        ? new Date(submissionResult.created_at).toLocaleTimeString()
                        : 'Just now'}
                    </span>
                  </div>
                </div>

                {/* Status Details / Output / Error Box */}
                <div className="result-details-section">
                  {/* PENDING Status Message */}
                  {status === 'PENDING' && (
                    <div className="status-progress-box">
                      <Clock size={16} className="progress-icon amber" />
                      <div>
                        <strong>Queued in RabbitMQ</strong>
                        <p>Waiting for the execution worker to pick up the submission...</p>
                      </div>
                    </div>
                  )}

                  {/* RUNNING Status Message */}
                  {status === 'RUNNING' && (
                    <div className="status-progress-box">
                      <Cpu size={16} className="progress-icon blue" />
                      <div>
                        <strong>Running inside Docker sandbox</strong>
                        <p>Compiling Java source code and evaluating test cases...</p>
                      </div>
                    </div>
                  )}

                  {/* ACCEPTED Output */}
                  {status === 'ACCEPTED' && (
                    <div className="accepted-summary-box">
                      <CheckCircle2 size={16} className="summary-icon green" />
                      <span>{submissionResult.output || 'All test cases passed successfully.'}</span>
                    </div>
                  )}

                  {/* Error & Diagnostic Output (Compilation / Runtime / Wrong Answer / Timeout) */}
                  {submissionResult.error && (
                    <div className="error-output-container">
                      <div className="output-section-label">Diagnostic / Error:</div>
                      <pre className="monospace-code-block error-block">
                        {submissionResult.error}
                      </pre>
                    </div>
                  )}

                  {/* Program Stdout (if present on non-accepted results) */}
                  {submissionResult.output && status !== 'ACCEPTED' && (
                    <div className="stdout-output-container">
                      <div className="output-section-label">Standard Output:</div>
                      <pre className="monospace-code-block stdout-block">
                        {submissionResult.output}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. NETWORK / CREATION ERROR STATE */}
            {executionState === 'error' && (
              <div className="console-card error">
                <div className="console-card-header">
                  <ShieldAlert size={18} className="card-icon red" />
                  <h4>Submission Error</h4>
                </div>
                <div className="console-card-body">
                  <p className="error-text">
                    {error?.message || 'Failed to communicate with backend submission endpoint.'}
                  </p>
                  <p className="error-subtext">
                    Make sure the CodeLens backend server is running on <code>http://localhost:5000</code>.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TEST CASES TAB */}
        {activeTab === 'testcases' && (
          <div className="testcases-panel">
            <div className="testcase-item">
              <span className="case-title">Sample Test Case 1</span>
              <div className="testcase-box">
                <span className="case-label">Input:</span>
                <code>4 9 \n 2 7 11 15</code>
              </div>
              <div className="testcase-box">
                <span className="case-label">Expected Output:</span>
                <code>0 1</code>
              </div>
            </div>
            <div className="testcase-item">
              <span className="case-title">Sample Test Case 2</span>
              <div className="testcase-box">
                <span className="case-label">Input:</span>
                <code>3 6 \n 3 2 4</code>
              </div>
              <div className="testcase-box">
                <span className="case-label">Expected Output:</span>
                <code>1 2</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
