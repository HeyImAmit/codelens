import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Code } from 'lucide-react';
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

  return (
    <div
      className="problem-card"
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Solve problem: ${problem.title}, Difficulty: ${problem.difficulty}`}
    >
      <div className="card-header-row">
        <div className="card-id-title">
          <span className="problem-num">#{problem.id}</span>
          <h3 className="problem-title">{problem.title}</h3>
        </div>

        <span className={`diff-tag ${diffLower}`}>
          {problem.difficulty}
        </span>
      </div>

      <p className="problem-desc-preview">
        {problem.description || 'No description provided.'}
      </p>

      <div className="card-footer-row">
        <div className="card-tags">
          <span className="card-tag">
            <Code size={12} />
            <span>DSA</span>
          </span>
          {problem.constraints && (
            <span className="card-tag">Constraints</span>
          )}
        </div>

        <div className="card-action">
          <span>Solve</span>
          <ArrowRight size={13} className="action-arrow" />
        </div>
      </div>
    </div>
  );
}
