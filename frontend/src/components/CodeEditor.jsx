import React from 'react';
import Editor from '@monaco-editor/react';
import './CodeEditor.css';

export default function CodeEditor({ language, code, onChange }) {
  // Map language value to Monaco language identifier
  const getMonacoLanguage = (lang) => {
    if (lang === 'cpp') return 'cpp';
    if (lang === 'python') return 'python';
    return 'java';
  };

  return (
    <div className="monaco-editor-wrapper">
      <Editor
        height="100%"
        language={getMonacoLanguage(language)}
        value={code}
        onChange={(value) => onChange(value || '')}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          bracketPairColorization: { enabled: true },
          padding: { top: 12, bottom: 12 },
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          tabSize: 4,
        }}
        loading={
          <div className="editor-loading-placeholder">
            <div className="skeleton-pulse editor-skeleton" />
            <span className="loading-text">Initializing Monaco Editor...</span>
          </div>
        }
      />
    </div>
  );
}
