import React from 'react';
import './ProblemStats.css';

export default function ProblemStats({ problems = [] }) {
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
    <div className="problem-stats-container">
      <div className="stats-row">
        {/* Total Problems */}
        <div className="stat-card">
          <span className="stat-label">Total Problems</span>
          <div className="stat-value-group">
            <span className="stat-value">{total}</span>
            <span className="stat-meta">available</span>
          </div>
        </div>

        {/* Easy */}
        <div className="stat-card">
          <span className="stat-label easy">Easy</span>
          <div className="stat-value-group">
            <span className="stat-value easy">{easyCount}</span>
            <span className="stat-pill easy">
              {total > 0 ? Math.round((easyCount / total) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Medium */}
        <div className="stat-card">
          <span className="stat-label medium">Medium</span>
          <div className="stat-value-group">
            <span className="stat-value medium">{mediumCount}</span>
            <span className="stat-pill medium">
              {total > 0 ? Math.round((mediumCount / total) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Hard */}
        <div className="stat-card">
          <span className="stat-label hard">Hard</span>
          <div className="stat-value-group">
            <span className="stat-value hard">{hardCount}</span>
            <span className="stat-pill hard">
              {total > 0 ? Math.round((hardCount / total) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
