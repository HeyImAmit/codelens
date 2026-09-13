import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import './AILoading.css';

export default function AILoading({ message = 'Thinking...', subtext = 'Analyzing context with CodeLens AI...' }) {
  return (
    <div className="ai-loading-container" role="status" aria-live="polite">
      <div className="ai-loading-glow">
        <div className="ai-loading-spinner-box">
          <Loader2 size={24} className="ai-spin-icon" />
          <Sparkles size={12} className="ai-sparkle-center" />
        </div>
      </div>
      <p className="ai-loading-message">{message}</p>
      {subtext && <span className="ai-loading-subtext">{subtext}</span>}
    </div>
  );
}
