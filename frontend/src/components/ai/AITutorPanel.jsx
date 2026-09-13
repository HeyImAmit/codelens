import React, { useState } from 'react';
import { Sparkles, Lightbulb, Code2, MessageSquare, Bot } from 'lucide-react';
import HintCard from './HintCard';
import CodeReviewCard from './CodeReviewCard';
import TutorInput from './TutorInput';
import './AITutorPanel.css';

export default function AITutorPanel({ problem, problemId, language, sourceCode }) {
  // AI Sub-tabs: 'hints' | 'review' | 'tutor'
  const [activeTab, setActiveTab] = useState('hints');

  const effectiveProblemId = Number(problemId || problem?.id || problem?.problem_id);

  if (!problem && !effectiveProblemId) {
    return (
      <div className="ai-panel-empty">
        <Bot size={24} className="ai-empty-icon" />
        <p>Select a problem to enable CodeLens AI features.</p>
      </div>
    );
  }

  return (
    <div className="ai-tutor-panel">
      {/* Panel Top Navigation Bar */}
      <div className="ai-panel-top-nav">
        <div className="ai-panel-brand">
          <Sparkles size={14} className="brand-sparkle-icon" />
          <span className="brand-title">CodeLens AI</span>
        </div>

        {/* Feature Tab Selector */}
        <div className="ai-mode-tabs" role="tablist" aria-label="AI Workspace Tools">
          <button
            role="tab"
            aria-selected={activeTab === 'hints'}
            className={`ai-mode-btn ${activeTab === 'hints' ? 'active' : ''}`}
            onClick={() => setActiveTab('hints')}
            title="Progressive Hint System"
          >
            <Lightbulb size={13} />
            <span>Hints</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'review'}
            className={`ai-mode-btn ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => setActiveTab('review')}
            title="AI Code Review"
          >
            <Code2 size={13} />
            <span>Code Review</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'tutor'}
            className={`ai-mode-btn ${activeTab === 'tutor' ? 'active' : ''}`}
            onClick={() => setActiveTab('tutor')}
            title="Ask DSA Tutor"
          >
            <MessageSquare size={13} />
            <span>Ask Tutor</span>
          </button>
        </div>
      </div>

      {/* Main Panel Viewport with state preservation across tabs */}
      <div className="ai-panel-viewport">
        <div className={`ai-tab-pane ${activeTab === 'hints' ? 'active' : 'hidden'}`} role="tabpanel">
          <HintCard
            problemId={effectiveProblemId}
            problemTitle={problem?.title}
            sourceCode={sourceCode}
          />
        </div>

        <div className={`ai-tab-pane ${activeTab === 'review' ? 'active' : 'hidden'}`} role="tabpanel">
          <CodeReviewCard
            problemId={effectiveProblemId}
            language={language}
            sourceCode={sourceCode}
          />
        </div>

        <div className={`ai-tab-pane ${activeTab === 'tutor' ? 'active' : 'hidden'}`} role="tabpanel">
          <TutorInput
            problemTitle={problem?.title}
            problemTopic={problem?.topic}
          />
        </div>
      </div>
    </div>
  );
}
