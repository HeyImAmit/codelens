import React from 'react';
import { RotateCcw, Code2, Play, Send, RefreshCw } from 'lucide-react';
import './WorkspaceToolbar.css';

export default function WorkspaceToolbar({
  language,
  onLanguageChange,
  onResetCode,
  onRunCode,
  onSubmitCode,
  isExecuting,
  executionMode, // 'idle' | 'running' | 'submitting'
  lastVerdict,   // 'ACCEPTED' | 'WRONG_ANSWER' | etc.
}) {
  const languages = [
    { label: 'Java', value: 'java' },
    { label: 'C++', value: 'cpp' },
    { label: 'Python', value: 'python' },
  ];

  return (
    <div className="workspace-toolbar">
      {/* Left: Language Selector & Reset */}
      <div className="toolbar-left-group">
        <div className="toolbar-item language-selector-wrapper">
          <Code2 size={15} className="selector-icon" />
          <select
            className="language-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            aria-label="Select programming language"
            disabled={isExecuting}
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <button
          className="toolbar-btn reset-btn"
          onClick={onResetCode}
          title="Reset starter code for current language"
          disabled={isExecuting}
          aria-label="Reset code to initial starter template"
        >
          <RotateCcw size={13} />
          <span className="btn-label">Reset</span>
        </button>
      </div>

      {/* Right: Primary & Secondary Execution Actions */}
      <div className="toolbar-right-group">
        {/* Secondary: Run Code Button */}
        <button
          className="toolbar-btn run-btn"
          onClick={onRunCode}
          disabled={isExecuting}
          title="Execute code in Docker sandbox against test cases"
          aria-label="Run code in sandbox"
        >
          {isExecuting && executionMode === 'run' ? (
            <>
              <RefreshCw size={13} className="spin-icon" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play size={13} className="run-icon" />
              <span>Run Code</span>
            </>
          )}
        </button>

        {/* Primary: Submit Button */}
        <button
          className="toolbar-btn submit-btn"
          onClick={onSubmitCode}
          disabled={isExecuting}
          title="Submit solution for official evaluation"
          aria-label="Submit solution"
        >
          {isExecuting && executionMode === 'submit' ? (
            <>
              <RefreshCw size={13} className="spin-icon" />
              <span>Evaluating...</span>
            </>
          ) : (
            <>
              <Send size={13} />
              <span>Submit</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
