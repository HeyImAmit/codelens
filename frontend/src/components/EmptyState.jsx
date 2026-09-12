import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';
import './EmptyState.css';

export default function EmptyState({ onReset }) {
  return (
    <div className="empty-state-card glass-panel">
      <div className="empty-icon-wrapper">
        <SearchX size={32} />
      </div>
      <h3 className="empty-title">No problems found</h3>
      <p className="empty-subtitle">
        We couldn't find any problem matching your search criteria or filter choices.
      </p>
      <button className="clear-filters-action" onClick={onReset}>
        <RotateCcw size={16} />
        <span>Clear Search & Filters</span>
      </button>
    </div>
  );
}
