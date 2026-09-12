import React from 'react';
import { Sparkles, Activity, ShieldAlert, Cpu, Lightbulb, Lock } from 'lucide-react';
import './CodeLensAnalysisPanel.css';

export default function CodeLensAnalysisPanel({ submissionResult, isEvaluating }) {
  return (
    <div className="codelens-analysis-panel">
      {/* Panel Header */}
      <div className="analysis-header">
        <div className="analysis-title-group">
          <Sparkles size={16} className="analysis-brand-icon" />
          <h3>CodeLens Analysis</h3>
        </div>
        <span className="analysis-badge">
          <Lock size={11} />
          <span>Engine v1.0 • Standby</span>
        </span>
      </div>

      {/* Panel Body */}
      <div className="analysis-body">
        {/* State 1: Active Code Evaluation In Progress */}
        {isEvaluating && (
          <div className="analysis-evaluating-state">
            <div className="spinner-medium" />
            <p>Evaluating submission in Docker sandbox...</p>
            <span className="evaluating-subtext">CodeLens analysis prepares structural review once execution completes.</span>
          </div>
        )}

        {/* State 2: Standby / Structured Overview */}
        {!isEvaluating && (
          <div className="analysis-content-grid">
            {/* Complexity Estimation Card */}
            <div className="analysis-card">
              <div className="analysis-card-header">
                <Activity size={14} className="card-icon cyan" />
                <h4>Algorithmic Complexity</h4>
              </div>
              <div className="analysis-metrics-row">
                <div className="metric-box">
                  <span className="metric-label">Time Complexity</span>
                  <span className="metric-placeholder">O(n) / O(n log n)</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Space Complexity</span>
                  <span className="metric-placeholder">O(1) / O(n)</span>
                </div>
              </div>
              <p className="card-explanation">
                Asymptotic time and auxiliary space consumption evaluated against input constraints.
              </p>
            </div>

            {/* Edge Cases & Invariants Card */}
            <div className="analysis-card">
              <div className="analysis-card-header">
                <ShieldAlert size={14} className="card-icon amber" />
                <h4>Edge Cases & Invariants</h4>
              </div>
              <ul className="edge-cases-list">
                <li>• Boundary inputs (empty collections, single elements)</li>
                <li>• Integer overflow and extreme numeric bounds</li>
                <li>• Duplicate key collisions and ordering guarantees</li>
              </ul>
            </div>

            {/* Optimization Insights Card */}
            <div className="analysis-card">
              <div className="analysis-card-header">
                <Lightbulb size={14} className="card-icon violet" />
                <h4>Optimization Insights</h4>
              </div>
              <p className="card-explanation">
                Algorithmic improvements, memory allocation reduction, and idiomatic data structures.
              </p>
            </div>

            {/* Callout Notice */}
            <div className="analysis-coming-soon-banner">
              <div className="banner-left">
                <Cpu size={16} className="banner-icon" />
                <div>
                  <strong>Deep AI Code Review Engine</strong>
                  <p>Comprehensive algorithmic audits and optimization recommendations will generate automatically here.</p>
                </div>
              </div>
              <button className="analyze-btn-disabled" disabled title="AI Analysis Engine is currently in development">
                <span>Analyze Solution</span>
                <span className="soon-pill">Milestone 5</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
