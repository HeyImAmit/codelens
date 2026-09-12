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

  const handleEditorWillMount = (monaco) => {
    // Define a refined VS Code / Obsidian inspired theme
    monaco.editor.defineTheme('codelens-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c084fc', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'f8fafc' },
        { token: 'string', foreground: '86efac' },
        { token: 'number', foreground: 'fcd34d' },
        { token: 'type', foreground: '67e8f9' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#f1f5f9',
        'editor.lineHighlightBackground': '#161b22',
        'editorLineNumber.foreground': '#484f58',
        'editorLineNumber.activeForeground': '#a5b4fc',
        'editorIndentGuide.background': '#21262d',
        'editorIndentGuide.activeBackground': '#30363d',
        'editorCursor.foreground': '#8b5cf6',
        'editor.selectionBackground': '#264f78',
      },
    });
  };

  return (
    <div className="monaco-editor-wrapper">
      <Editor
        height="100%"
        width="100%"
        language={getMonacoLanguage(language)}
        value={code}
        onChange={(value) => onChange(value || '')}
        theme="codelens-dark"
        beforeMount={handleEditorWillMount}
        options={{
          fontSize: 13.5,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          bracketPairColorization: { enabled: true },
          padding: { top: 10, bottom: 10 },
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          tabSize: 4,
          wordWrap: 'on',
        }}
        loading={
          <div className="editor-loading-placeholder">
            <div className="skeleton-pulse editor-skeleton" />
            <span className="loading-text">Initializing Monaco IDE...</span>
          </div>
        }
      />
    </div>
  );
}
