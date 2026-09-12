import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProblemById } from '../services/api';
import { ArrowLeft, Code2, Sparkles, Terminal, Cpu, Clock, AlertCircle } from 'lucide-react';
import './ProblemPage.css';

export default function ProblemPage() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadProblem() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProblemById(id);
        if (isMounted) setProblem(data);
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProblem();
    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="problem-page-placeholder">
      <div className="container">
        {/* Navigation Back */}
        <Link to="/problems" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Problems</span>
        </Link>

        {/* Workspace Card */}
        <div className="workspace-placeholder-card glass-panel">
          <div className="placeholder-header">
            <div className="placeholder-badge">
              <Sparkles size={14} />
              <span>Milestone 2 • Workspace Preview</span>
            </div>
            
            {loading ? (
              <h1 className="problem-workspace-title text-gradient">
                Loading Problem #{id}...
              </h1>
            ) : error ? (
              <h1 className="problem-workspace-title text-gradient">
                Problem #{id}
              </h1>
            ) : (
              <div className="problem-meta-box">
                <h1 className="problem-workspace-title text-gradient">
                  {problem?.title || `Problem #${id}`}
                </h1>
                <span className={`diff-pill ${String(problem?.difficulty).toLowerCase()}`}>
                  {problem?.difficulty}
                </span>
              </div>
            )}
          </div>

          <div className="placeholder-body">
            <div className="icon-graphic-box">
              <Terminal size={40} className="graphic-icon" />
              <Cpu size={24} className="graphic-sparkle" />
            </div>
            <h2 className="placeholder-heading">Interactive Problem Workspace</h2>
            <p className="placeholder-description">
              The CodeLens online Monaco editor, test case runner, sandbox execution environment, and AI code review interface will be connected in the next development milestone.
            </p>

            {problem && problem.description && (
              <div className="problem-snippet-preview">
                <h4 className="preview-label">Problem Overview:</h4>
                <p className="preview-text">{problem.description}</p>
              </div>
            )}

            {/* Upcoming Features Pills */}
            <div className="upcoming-features">
              <div className="feature-pill">
                <Code2 size={14} />
                <span>Monaco Code Editor</span>
              </div>
              <div className="feature-pill">
                <Cpu size={14} />
                <span>Docker Sandbox Execution</span>
              </div>
              <div className="feature-pill">
                <Clock size={14} />
                <span>Test Suite Evaluator</span>
              </div>
              <div className="feature-pill">
                <Sparkles size={14} />
                <span>AI Code Reviewer</span>
              </div>
            </div>

            <div className="placeholder-actions">
              <Link to="/problems" className="primary-back-btn">
                <ArrowLeft size={16} />
                <span>Return to Problems Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
