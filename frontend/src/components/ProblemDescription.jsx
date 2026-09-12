import React from 'react';
import { CheckCircle2, AlertTriangle, Zap, FileText, Code2, ListChecks, HelpCircle } from 'lucide-react';
import './ProblemDescription.css';

export default function ProblemDescription({ problem }) {
  if (!problem) return null;

  const diffLower = String(problem.difficulty).toLowerCase();

  const getDifficultyIcon = () => {
    if (diffLower === 'easy') return <CheckCircle2 size={13} />;
    if (diffLower === 'medium') return <AlertTriangle size={13} />;
    return <Zap size={13} />;
  };

  return (
    <div className="problem-description-panel">
      {/* Header Info */}
      <div className="description-header">
        <div className="title-badge-group">
          <span className="problem-id-tag">#{problem.id}</span>
          <h2 className="problem-panel-title">{problem.title}</h2>
        </div>
        <span className={`difficulty-badge ${diffLower}`}>
          {getDifficultyIcon()}
          <span>{problem.difficulty}</span>
        </span>
      </div>

      {/* Description Content Area */}
      <div className="description-scroll-body">
        {/* Main Problem Statement */}
        <section className="desc-section">
          <div className="section-heading">
            <FileText size={16} />
            <h3>Description</h3>
          </div>
          <div className="problem-statement-text">
            {problem.description || 'No description provided for this problem.'}
          </div>
        </section>

        {/* Input Format */}
        {problem.input_format && (
          <section className="desc-section">
            <div className="section-heading">
              <Code2 size={16} />
              <h3>Input Format</h3>
            </div>
            <div className="format-box">
              <code>{problem.input_format}</code>
            </div>
          </section>
        )}

        {/* Output Format */}
        {problem.output_format && (
          <section className="desc-section">
            <div className="section-heading">
              <Code2 size={16} />
              <h3>Output Format</h3>
            </div>
            <div className="format-box">
              <code>{problem.output_format}</code>
            </div>
          </section>
        )}

        {/* Constraints */}
        {problem.constraints && (
          <section className="desc-section">
            <div className="section-heading">
              <ListChecks size={16} />
              <h3>Constraints</h3>
            </div>
            <div className="constraints-box">
              <code>{problem.constraints}</code>
            </div>
          </section>
        )}

        {/* AI Practice Hint Footer */}
        <div className="ai-hint-callout">
          <HelpCircle size={16} className="hint-icon" />
          <div>
            <strong>AI Feedback Engine</strong>
            <p>Write your solution in the editor and submit. Detailed time/space complexity analysis & hints will evaluate after execution.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
