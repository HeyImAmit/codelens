import React from 'react';
import { RotateCcw, Code2, Sparkles } from 'lucide-react';
import './WorkspaceToolbar.css';

export default function WorkspaceToolbar({
  language,
  onLanguageChange,
  onResetCode,
}) {
  const languages = [
    { label: 'Java', value: 'java' },
    { label: 'C++', value: 'cpp' },
    { label: 'Python', value: 'python' },
  ];

  return (
    <div className="workspace-toolbar">
      {/* Left: Language Selector */}
      <div className="toolbar-left">
        <div className="language-selector-wrapper">
          <Code2 size={16} className="selector-icon" />
          <select
            className="language-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            aria-label="Select programming language"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Reset Action */}
      <div className="toolbar-right">
        <button
          className="toolbar-action-btn reset-btn"
          onClick={onResetCode}
          title="Reset starter code for current language"
        >
          <RotateCcw size={14} />
          <span>Reset Code</span>
        </button>

        <div className="editor-status-pill">
          <Sparkles size={13} className="sparkle-icon" />
          <span>Monaco IDE</span>
        </div>
      </div>
    </div>
  );
}
