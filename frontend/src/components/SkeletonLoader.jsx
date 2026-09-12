import React from 'react';
import './SkeletonLoader.css';

export default function SkeletonLoader({ count = 3 }) {
  return (
    <div className="skeleton-container">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="skeleton-card glass-panel">
          <div className="skeleton-left">
            <div className="skeleton-pulse skeleton-badge" />
            <div className="skeleton-info">
              <div className="skeleton-title-row">
                <div className="skeleton-pulse skeleton-title" />
                <div className="skeleton-pulse skeleton-pill" />
              </div>
              <div className="skeleton-pulse skeleton-desc" />
              <div className="skeleton-pulse skeleton-tags" />
            </div>
          </div>
          <div className="skeleton-right">
            <div className="skeleton-pulse skeleton-button" />
          </div>
        </div>
      ))}
    </div>
  );
}
