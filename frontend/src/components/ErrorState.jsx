import React from 'react';
import { AlertTriangle, RefreshCw, ServerCrash } from 'lucide-react';
import './ErrorState.css';

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="error-state-card glass-panel">
      <div className="error-icon-wrapper">
        <ServerCrash size={28} />
      </div>
      <h3 className="error-title">Couldn't load problems</h3>
      <p className="error-message">
        {error?.message || 'Failed to connect to the backend service.'}
      </p>
      <div className="error-hint">
        <AlertTriangle size={14} className="hint-icon" />
        <span>Make sure the CodeLens backend is running on <code>http://localhost:5000</code></span>
      </div>
      <button className="retry-btn" onClick={onRetry}>
        <RefreshCw size={16} />
        <span>Retry Connection</span>
      </button>
    </div>
  );
}
