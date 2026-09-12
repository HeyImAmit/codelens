import React from 'react';
import { FileText, Code2, ListChecks, HelpCircle } from 'lucide-react';
import './ProblemDescription.css';

export default function ProblemDescription({ problem }) {
  if (!problem) return null;

  const diffLower = String(problem.difficulty).toLowerCase();

  return (
    <div className="problem-description-panel">
      {/* Header Info */}
      <div className="description-header">
        <div className="title-group">
          <span className="problem-id-tag">#{problem.id}</span>
          <h2 className="problem-panel-title">{problem.title}</h2>
        </div>
        <span className={`diff-badge ${diffLower}`}>
          {problem.difficulty}
        </span>
      </div>

      {/* Description Content Area */}
      <div className="description-scroll-body">
        {/* Main Problem Statement */}
        <section className="desc-section">
          <div className="section-heading">
            <FileText size={14} />
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
              <Code2 size={14} />
              <h3>Input Format</h3>
            </div>
            <div className="code-spec-box">
              <code>{problem.input_format}</code>
            </div>
          </section>
        )}

        {/* Output Format */}
        {problem.output_format && (
          <section className="desc-section">
            <div className="section-heading">
              <Code2 size={14} />
              <h3>Output Format</h3>
            </div>
            <div className="code-spec-box">
              <code>{problem.output_format}</code>
            </div>
          </section>
        )}

        {/* Constraints */}
        {problem.constraints && (
          <section className="desc-section">
            <div className="section-heading">
              <ListChecks size={14} />
              <h3>Constraints</h3>
            </div>
            <div className="code-spec-box">
              <code>{problem.constraints}</code>
            </div>
          </section>
        )}

        {/* Practice Callout */}
        <div className="workspace-guidance-callout">
          <HelpCircle size={15} className="callout-icon" />
          <div>
            <strong>Automated Evaluation</strong>
            <p>Test with <strong>Run Code</strong> against sample cases or <strong>Submit</strong> to evaluate against all judging test cases in Docker.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
