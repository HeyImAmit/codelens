import React, { useState } from 'react';
import { Terminal, CheckCircle2, Clock, Info, ShieldAlert, Cpu, Sparkles, Play } from 'lucide-react';
import './OutputPanel.css';

export default function OutputPanel({ executionState, submissionResult, error }) {
  const [activeTab, setActiveTab] = useState('output'); // 'output' | 'testcases'

  return (
    <div className="output-panel">
      {/* Tab Navigation */}
      <div className="output-tabs-header">
        <div className="tabs-group">
          <button
            className={`tab-btn ${activeTab === 'output' ? 'active' : ''}`}
            onClick={() => setActiveTab('output')}
          >
            <Terminal size={14} />
            <span>Output</span>
            {executionState === 'submitted' && <span className="tab-dot green" />}
            {executionState === 'running' && <span className="tab-dot blue" />}
          </button>
          <button
            className={`tab-btn ${activeTab === 'testcases' ? 'active' : ''}`}
            onClick={() => setActiveTab('testcases')}
          >
            <Cpu size={14} />
            <span>Test Cases</span>
          </button>
        </div>

        {/* Status Indicator Pill */}
        <div className="panel-status-indicator">
          {executionState === 'idle' && (
            <span className="status-tag idle">
              <Info size={12} /> Ready
            </span>
          )}
          {executionState === 'running' && (
            <span className="status-tag info">
              <Sparkles size={12} /> Execution Engine Notice
            </span>
          )}
          {executionState === 'submitting' && (
            <span className="status-tag submitting">
              <Clock size={12} /> Submitting...
            </span>
          )}
          {executionState === 'submitted' && (
            <span className="status-tag pending">
              <Clock size={12} /> Status: PENDING
            </span>
          )}
          {executionState === 'error' && (
            <span className="status-tag error">
              <ShieldAlert size={12} /> Submission Failed
            </span>
          )}
        </div>
      </div>

      {/* Tab Body */}
      <div className="output-body">
        {activeTab === 'output' && (
          <div className="output-console">
            {/* Idle State */}
            {executionState === 'idle' && (
              <div className="console-message idle">
                <Play size={20} className="console-icon" />
                <p>Run your code or submit your solution to view execution output.</p>
              </div>
            )}

            {/* Run Button Clicked State */}
            {executionState === 'running' && (
              <div className="console-card info">
                <div className="console-card-header">
                  <Cpu size={18} className="card-icon" />
                  <h4>Execution Engine Status</h4>
                </div>
                <div className="console-card-body">
                  <p className="primary-notice">
                    Code execution engine is coming in the next backend infrastructure milestone.
                  </p>

                  <div className="notice-details">
                    <p>• Code execution inside isolated Docker sandboxes with resource limits is currently under development.</p>
                    <p>• Per security design, code is not executed locally in the browser (`eval()` is prohibited).</p>
                    <p>• You can test real backend API integration by clicking the <strong>Submit</strong> button.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submitting State */}
            {executionState === 'submitting' && (
              <div className="console-message submitting">
                <div className="spinner" />
                <p>Creating submission in PostgreSQL database via <code>POST /api/submissions</code>...</p>
              </div>
            )}

            {/* Submitted Success State */}
            {executionState === 'submitted' && submissionResult && (
              <div className="console-card submission-success">
                <div className="console-card-header">
                  <CheckCircle2 size={18} className="card-icon green" />
                  <h4>Submission Received</h4>
                  <span className="submission-id-pill">
                    Submission #{submissionResult.id}
                  </span>
                </div>
                <div className="console-card-body">
                  <div className="submission-meta-grid">
                    <div className="meta-item">
                      <span className="meta-label">Status</span>
                      <span className="meta-value pending-badge">
                        <Clock size={13} />
                        {submissionResult.status || 'PENDING'}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Language</span>
                      <span className="meta-value code-font">
                        {submissionResult.language?.toUpperCase()}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Problem ID</span>
                      <span className="meta-value">
                        #{submissionResult.problem_id || submissionResult.problemId}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Created At</span>
                      <span className="meta-value">
                        {submissionResult.created_at
                          ? new Date(submissionResult.created_at).toLocaleTimeString()
                          : 'Just now'}
                      </span>
                    </div>
                  </div>

                  <div className="submission-note">
                    <Info size={14} className="note-icon" />
                    <span>
                      Your submission is queued in PostgreSQL with status <strong>PENDING</strong>. Asynchronous Docker sandbox evaluation & AI review will run when the RabbitMQ worker pipeline is online.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
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

        {activeTab === 'testcases' && (
          <div className="testcases-panel">
            <div className="testcase-item">
              <span className="case-title">Sample Test Case 1</span>
              <div className="testcase-box">
                <span className="case-label">Input:</span>
                <code>nums = [2,7,11,15], target = 9</code>
              </div>
              <div className="testcase-box">
                <span className="case-label">Expected Output:</span>
                <code>[0,1]</code>
              </div>
            </div>
            <div className="testcase-item">
              <span className="case-title">Sample Test Case 2</span>
              <div className="testcase-box">
                <span className="case-label">Input:</span>
                <code>nums = [3,2,4], target = 6</code>
              </div>
              <div className="testcase-box">
                <span className="case-label">Expected Output:</span>
                <code>[1,2]</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
