import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowUpRight, CheckCircle2, AlertTriangle, Zap, Code } from 'lucide-react';
import './ProblemCard.css';

export default function ProblemCard({ problem }) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/problems/${problem.id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavigate();
    }
  };

  const diffLower = String(problem.difficulty).toLowerCase();

  // Pick difficulty icon and visual metadata
  const getDifficultyIcon = () => {
    if (diffLower === 'easy') return <CheckCircle2 size={13} />;
    if (diffLower === 'medium') return <AlertTriangle size={13} />;
    return <Zap size={13} />;
  };

  return (
    <div
      className={`problem-card glass-panel ${diffLower}`}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Solve problem: ${problem.title}, Difficulty: ${problem.difficulty}`}
    >
      <div className="card-left-section">
        {/* Problem ID Badge */}
        <div className="problem-id-pill">
          #{String(problem.id).padStart(2, '0')}
        </div>

        {/* Problem Main Content */}
        <div className="problem-main-info">
          <div className="title-row">
            <h3 className="problem-title">{problem.title}</h3>
            {/* Difficulty Badge */}
            <span className={`difficulty-badge ${diffLower}`}>
              {getDifficultyIcon()}
              <span>{problem.difficulty}</span>
            </span>
          </div>

          {/* Description Preview */}
          <p className="problem-description-preview">
            {problem.description || 'No description provided for this problem.'}
          </p>

          {/* Card Footer Tags */}
          <div className="card-tags">
            <span className="card-tag">
              <Code size={12} />
              <span>DSA</span>
            </span>
            {problem.constraints && (
              <span className="card-tag muted">
                Has Constraints
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button & Chevron */}
      <div className="card-right-section">
        <button
          className="solve-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleNavigate();
          }}
          tabIndex={-1}
        >
          <span>Solve</span>
          <ArrowUpRight size={15} className="solve-btn-icon" />
        </button>
        <ChevronRight size={18} className="chevron-icon" />
      </div>
    </div>
  );
}
