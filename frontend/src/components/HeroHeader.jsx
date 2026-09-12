import React from 'react';
import { Sparkles, Code, Cpu, Zap } from 'lucide-react';
import './HeroHeader.css';

export default function HeroHeader() {
  return (
    <section className="hero-header">
      <div className="hero-glow-backdrop" aria-hidden="true" />
      <div className="container hero-container">
        {/* Top Status Pill */}
        <div className="hero-status-pill">
          <Sparkles size={14} className="hero-pill-icon" />
          <span>AI-Powered Practice Workspace</span>
          <span className="hero-pill-divider">•</span>
          <span className="hero-pill-highlight">Next-Gen DSA</span>
        </div>

        {/* Hero Title */}
        <h1 className="hero-title">
          Sharpen your <span className="text-gradient">DSA skills</span>.
        </h1>

        {/* Hero Subtitle */}
        <p className="hero-subtitle">
          Practice curated problems, analyze algorithmic efficiency, and elevate your code quality with instant, AI-powered feedback.
        </p>

        {/* Feature Badges */}
        <div className="hero-tags">
          <div className="hero-tag">
            <Code size={14} />
            <span>Interactive Editor</span>
          </div>
          <div className="hero-tag">
            <Cpu size={14} />
            <span>Sandbox Execution</span>
          </div>
          <div className="hero-tag">
            <Zap size={14} />
            <span>AI Feedback</span>
          </div>
        </div>
      </div>
    </section>
  );
}
