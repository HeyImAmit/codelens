import React from 'react';
import { Terminal, Cpu, ShieldCheck } from 'lucide-react';
import './HeroHeader.css';

export default function HeroHeader() {
  return (
    <section className="hero-header">
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <span>Interactive Algorithmic Workspace</span>
          </div>

          <h1 className="hero-title">
            Practice. Execute. Refine.
          </h1>

          <p className="hero-subtitle">
            Solve curated Data Structures & Algorithms problems with real-time sandbox execution and performance analysis.
          </p>

          <div className="hero-features">
            <div className="feature-item">
              <Terminal size={14} className="feature-icon" />
              <span>Monaco IDE</span>
            </div>
            <div className="feature-item">
              <Cpu size={14} className="feature-icon" />
              <span>Docker Isolated Judge</span>
            </div>
            <div className="feature-item">
              <ShieldCheck size={14} className="feature-icon" />
              <span>Automated Test Evaluation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
