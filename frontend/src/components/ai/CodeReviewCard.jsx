import React, { useState } from 'react';
import {
  Code2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  ShieldAlert,
  ThumbsUp,
  Lightbulb,
  RotateCcw,
  Clock,
  HardDrive
} from 'lucide-react';
import { reviewCode } from '../../services/api';
import AILoading from './AILoading';
import AISourceList from './AISourceList';
import './CodeReviewCard.css';

export default function CodeReviewCard({ problemId, language, sourceCode }) {
  const [reviewResult, setReviewResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRunReview = async () => {
    if (!problemId || loading) return;

    if (!sourceCode || sourceCode.trim().length === 0) {
      setError('Please write some code in the editor before requesting a review.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await reviewCode({
        problemId,
        language,
        sourceCode,
      });

      if (response && response.success && response.review) {
        setReviewResult({
          review: response.review,
          sources: response.sources || [],
          timing: response.timing || null,
        });
      } else {
        throw new Error('Received invalid review payload from AI review service.');
      }
    } catch (err) {
      setError(err.message || 'Failed to complete code review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const review = reviewResult?.review;

  const renderCorrectnessBadge = (assessment) => {
    const norm = String(assessment || '').toUpperCase();
    if (norm === 'LIKELY_CORRECT') {
      return (
        <div className="correctness-badge success">
          <CheckCircle2 size={13} />
          <span>Likely Correct</span>
        </div>
      );
    }
    if (norm === 'POTENTIAL_ISSUES') {
      return (
        <div className="correctness-badge warning">
          <AlertTriangle size={13} />
          <span>Potential Issues</span>
        </div>
      );
    }
    return (
      <div className="correctness-badge danger">
        <XCircle size={13} />
        <span>Correctness Risks</span>
      </div>
    );
  };

  return (
    <div className="code-review-card-container">
      {/* State 0: Initial State before Review */}
      {!reviewResult && !loading && (
        <div className="review-initial-state">
          <div className="review-empty-icon-wrap">
            <Code2 size={24} className="review-empty-icon" />
          </div>
          <h4>AI Static Code Analysis</h4>
          <p className="review-initial-desc">
            Get an instant advisory review of your code's correctness risks, Big-O time and space complexity, edge-case resilience, and quality.
          </p>
          <button
            className="review-action-btn primary"
            onClick={handleRunReview}
            disabled={loading}
            aria-label="Request AI code review"
          >
            <Sparkles size={14} />
            <span>Review My Code</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <AILoading
          message="Analyzing Code Structure..."
          subtext="Auditing algorithmic logic, Big-O complexity, and boundary conditions..."
        />
      )}

      {/* Error Banner */}
      {error && !loading && (
        <div className="review-error-banner" role="alert">
          <p>{error}</p>
          <button className="review-retry-btn" onClick={handleRunReview}>
            Retry Review
          </button>
        </div>
      )}

      {/* Structured Review Results */}
      {review && !loading && (
        <div className="review-results-wrapper">
          {/* Header Bar */}
          <div className="review-header-bar">
            <div className="review-header-left">
              <span className="review-title">Static Code Review</span>
              <span className="review-lang-tag">{language}</span>
            </div>
            <div className="review-header-right">
              {renderCorrectnessBadge(review.correctness?.assessment)}
              <button
                className="review-reanalyze-btn"
                onClick={handleRunReview}
                title="Re-run review with current editor code"
                aria-label="Re-analyze code"
              >
                <RotateCcw size={12} />
                <span>Re-Analyze</span>
              </button>
            </div>
          </div>

          {/* 1. Summary Card */}
          {review.summary && (
            <div className="review-section-box summary-box">
              <p className="summary-text">{review.summary}</p>
            </div>
          )}

          {/* 2. Correctness Issues (if any) */}
          {review.correctness?.issues && review.correctness.issues.length > 0 && (
            <div className="review-section-box correctness-box">
              <div className="section-title-row">
                <AlertTriangle size={14} className="section-icon amber" />
                <h5>Correctness Observations</h5>
              </div>
              <ul className="review-bullet-list">
                {review.correctness.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. Complexity Card */}
          {review.complexity && (
            <div className="review-section-box complexity-box">
              <div className="section-title-row">
                <Activity size={14} className="section-icon cyan" />
                <h5>Complexity Breakdown</h5>
              </div>
              <div className="complexity-pills-row">
                <div className="complexity-metric-pill">
                  <Clock size={12} className="metric-icon" />
                  <span className="metric-name">Time:</span>
                  <span className="metric-value">{review.complexity.time || 'O(n)'}</span>
                </div>
                <div className="complexity-metric-pill">
                  <HardDrive size={12} className="metric-icon" />
                  <span className="metric-name">Space:</span>
                  <span className="metric-value">{review.complexity.space || 'O(1)'}</span>
                </div>
              </div>
              {review.complexity.assessment && (
                <p className="complexity-assessment-text">{review.complexity.assessment}</p>
              )}
            </div>
          )}

          {/* 4. Edge Cases */}
          {review.edgeCases && review.edgeCases.length > 0 && (
            <div className="review-section-box edgecases-box">
              <div className="section-title-row">
                <ShieldAlert size={14} className="section-icon violet" />
                <h5>Edge Cases & Boundary Resilience</h5>
              </div>
              <ul className="review-bullet-list">
                {review.edgeCases.map((ec, i) => (
                  <li key={i}>{ec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 5. Code Quality (Strengths & Improvements) */}
          {review.codeQuality && (
            <div className="review-section-box quality-box">
              <div className="section-title-row">
                <ThumbsUp size={14} className="section-icon green" />
                <h5>Code Quality & Patterns</h5>
              </div>
              <div className="quality-columns-grid">
                {review.codeQuality.strengths && review.codeQuality.strengths.length > 0 && (
                  <div className="quality-column">
                    <span className="column-subtitle">Strengths:</span>
                    <ul className="review-bullet-list compact strengths">
                      {review.codeQuality.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {review.codeQuality.improvements && review.codeQuality.improvements.length > 0 && (
                  <div className="quality-column">
                    <span className="column-subtitle">Improvements:</span>
                    <ul className="review-bullet-list compact improvements">
                      {review.codeQuality.improvements.map((imp, i) => (
                        <li key={i}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. Suggestions */}
          {review.suggestions && review.suggestions.length > 0 && (
            <div className="review-section-box suggestions-box">
              <div className="section-title-row">
                <Lightbulb size={14} className="section-icon amber" />
                <h5>Actionable Suggestions</h5>
              </div>
              <ul className="review-bullet-list">
                {review.suggestions.map((sug, i) => (
                  <li key={i}>{sug}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Grounded Sources */}
          <AISourceList sources={reviewResult.sources} timing={reviewResult.timing} />
        </div>
      )}
    </div>
  );
}
