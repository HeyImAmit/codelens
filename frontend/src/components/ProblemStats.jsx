import React from 'react';
import { Layers, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import './ProblemStats.css';

export default function ProblemStats({ problems = [] }) {
  // Calculate dynamic stats from problems array
  const total = problems.length;
  const easyCount = problems.filter(
    (p) => String(p.difficulty).toLowerCase() === 'easy'
  ).length;
  const mediumCount = problems.filter(
    (p) => String(p.difficulty).toLowerCase() === 'medium'
  ).length;
  const hardCount = problems.filter(
    (p) => String(p.difficulty).toLowerCase() === 'hard'
  ).length;

  return (
    <section className="problem-stats-section">
      <div className="container">
        <div className="stats-grid">
          {/* Total Problems Stat Card */}
          <div className="stat-card glass-panel total">
            <div className="stat-header">
              <span className="stat-label">Total Problems</span>
              <div className="stat-icon-bg total">
                <Layers size={18} />
              </div>
            </div>
            <div className="stat-value">{total}</div>
            <div className="stat-footer">
              <span className="stat-subtext">Available in repository</span>
            </div>
          </div>

          {/* Easy Stat Card */}
          <div className="stat-card glass-panel easy">
            <div className="stat-header">
              <span className="stat-label">Easy</span>
              <div className="stat-icon-bg easy">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="stat-value easy-text">{easyCount}</div>
            <div className="stat-footer">
              <span className="stat-progress-pill easy">
                {total > 0 ? Math.round((easyCount / total) * 100) : 0}% of total
              </span>
            </div>
          </div>

          {/* Medium Stat Card */}
          <div className="stat-card glass-panel medium">
            <div className="stat-header">
              <span className="stat-label">Medium</span>
              <div className="stat-icon-bg medium">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="stat-value medium-text">{mediumCount}</div>
            <div className="stat-footer">
              <span className="stat-progress-pill medium">
                {total > 0 ? Math.round((mediumCount / total) * 100) : 0}% of total
              </span>
            </div>
          </div>

          {/* Hard Stat Card */}
          <div className="stat-card glass-panel hard">
            <div className="stat-header">
              <span className="stat-label">Hard</span>
              <div className="stat-icon-bg hard">
                <Zap size={18} />
              </div>
            </div>
            <div className="stat-value hard-text">{hardCount}</div>
            <div className="stat-footer">
              <span className="stat-progress-pill hard">
                {total > 0 ? Math.round((hardCount / total) * 100) : 0}% of total
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
