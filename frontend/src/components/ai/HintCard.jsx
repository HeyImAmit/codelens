import React, { useState } from 'react';
import { Lightbulb, ArrowRight, RotateCcw, Sparkles, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import { generateHint } from '../../services/api';
import AILoading from './AILoading';
import AISourceList from './AISourceList';
import './HintCard.css';

const LEVEL_LABELS = {
  1: { title: 'Conceptual Nudge', desc: 'Identifies the DSA pattern or data structure' },
  2: { title: 'Algorithmic Direction', desc: 'Outlines the high-level strategy and invariant' },
  3: { title: 'Implementation Guidance', desc: 'Details state transitions and loop order' },
  4: { title: 'Detailed Explanation', desc: 'Walks through near-complete logic & complexity' },
};

export default function HintCard({ problemId, sourceCode }) {
  const [currentLevel, setCurrentLevel] = useState(0); // 0 = no hint generated yet
  const [hintHistory, setHintHistory] = useState([]); // array of { level, hint, concept, nextStep, sources, timing }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNextHint = async () => {
    if (!problemId || loading || currentLevel >= 4) return;

    const nextLevel = currentLevel + 1;
    setLoading(true);
    setError(null);

    // Extract previous hint strings to build progressive context
    const previousHints = hintHistory.map((h) => h.hint);

    try {
      const response = await generateHint({
        problemId,
        level: nextLevel,
        sourceCode: sourceCode && sourceCode.trim().length > 0 ? sourceCode : null,
        previousHints,
      });

      if (response && response.success && response.hint) {
        setHintHistory((prev) => [...prev, {
          ...response.hint,
          sources: response.sources || [],
          timing: response.timing || null,
        }]);
        setCurrentLevel(nextLevel);
      } else {
        throw new Error('Received unexpected response format from hint service.');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate hint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentLevel(0);
    setHintHistory([]);
    setError(null);
  };

  const latestHint = hintHistory.length > 0 ? hintHistory[hintHistory.length - 1] : null;

  return (
    <div className="hint-card-container">
      {/* Progress Stepper Bar */}
      <div className="hint-stepper-header">
        <div className="stepper-title">
          <Layers size={13} className="stepper-icon" />
          <span>Progressive Hint Scaffolding</span>
        </div>
        <div className="hint-steps-indicator">
          {[1, 2, 3, 4].map((step) => {
            const isDone = step <= currentLevel;
            const isCurrent = step === currentLevel;
            return (
              <div
                key={step}
                className={`hint-step-pill ${isDone ? 'done' : ''} ${isCurrent ? 'active' : ''}`}
                title={`Level ${step}: ${LEVEL_LABELS[step]?.title}`}
              >
                <span className="step-num">{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Hint Body Area */}
      <div className="hint-body-wrapper">
        {/* State 0: Initial Untriggered State */}
        {currentLevel === 0 && !loading && (
          <div className="hint-initial-state">
            <div className="hint-empty-icon-wrap">
              <Lightbulb size={24} className="hint-empty-icon" />
            </div>
            <h4>Need a hint on this problem?</h4>
            <p className="hint-initial-desc">
              Get progressive hints that guide your thinking step-by-step without spoiling the complete solution.
            </p>
            <div className="hint-tiers-preview">
              <span className="tier-preview-tag">1. Concept</span>
              <ChevronRight size={12} className="tier-arrow" />
              <span className="tier-preview-tag">2. Algorithm</span>
              <ChevronRight size={12} className="tier-arrow" />
              <span className="tier-preview-tag">3. Logic</span>
              <ChevronRight size={12} className="tier-arrow" />
              <span className="tier-preview-tag">4. Full Walkthrough</span>
            </div>
            <button
              className="hint-action-btn primary"
              onClick={fetchNextHint}
              disabled={loading}
              aria-label="Get initial conceptual hint"
            >
              <Sparkles size={14} />
              <span>Get Level 1 Hint</span>
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <AILoading
            message={`Generating Level ${currentLevel + 1} Hint...`}
            subtext={LEVEL_LABELS[currentLevel + 1]?.desc || 'Synthesizing algorithmic hint...'}
          />
        )}

        {/* Error Banner */}
        {error && !loading && (
          <div className="hint-error-banner" role="alert">
            <p>{error}</p>
            <button className="hint-retry-btn" onClick={fetchNextHint}>
              Try Again
            </button>
          </div>
        )}

        {/* Active Generated Hint Display */}
        {latestHint && !loading && (
          <div className="hint-display-card">
            {/* Level & Concept Header */}
            <div className="hint-display-header">
              <div className="hint-level-badge">
                <span className="level-tag">Level {latestHint.level}</span>
                <span className="level-title">{LEVEL_LABELS[latestHint.level]?.title}</span>
              </div>
              {latestHint.concept && (
                <span className="hint-concept-pill">
                  {latestHint.concept}
                </span>
              )}
            </div>

            {/* Hint Guidance Content */}
            <div className="hint-content-box">
              <p className="hint-text">{latestHint.hint}</p>
            </div>

            {/* Actionable Next Step Box */}
            {latestHint.nextStep && (
              <div className="hint-next-step-box">
                <div className="next-step-label">
                  <ArrowRight size={13} className="next-step-icon" />
                  <span>Next Step to Consider:</span>
                </div>
                <p className="next-step-text">{latestHint.nextStep}</p>
              </div>
            )}

            {/* Grounded Sources */}
            <AISourceList sources={latestHint.sources} timing={latestHint.timing} />

            {/* Bottom Actions: Next Hint or Complete */}
            <div className="hint-bottom-actions">
              {currentLevel < 4 ? (
                <button
                  className="hint-action-btn next-hint-btn"
                  onClick={fetchNextHint}
                  disabled={loading}
                  aria-label={`Get Level ${currentLevel + 1} hint`}
                >
                  <Sparkles size={14} />
                  <span>Get Level {currentLevel + 1} Hint ({LEVEL_LABELS[currentLevel + 1]?.title})</span>
                </button>
              ) : (
                <div className="hint-completed-banner">
                  <CheckCircle2 size={15} className="completed-icon" />
                  <span>All 4 hint tiers revealed. Ready to code your solution!</span>
                </div>
              )}

              <button
                className="hint-reset-btn"
                onClick={handleReset}
                title="Reset hints back to Level 1"
                aria-label="Reset hints"
              >
                <RotateCcw size={12} />
                <span>Reset Hints</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
