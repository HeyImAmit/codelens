import React from 'react';
import { Database, Link2 } from 'lucide-react';
import './AISourceList.css';

export default function AISourceList({ sources = [], timing = null }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="ai-sources-section">
      <div className="ai-sources-header">
        <div className="ai-sources-title">
          <Database size={12} className="source-icon" />
          <span>Grounded Knowledge Sources ({sources.length})</span>
        </div>
        {timing && timing.totalMs !== undefined && (
          <span className="ai-timing-badge" title={`Retrieval: ${timing.retrievalMs || 0}ms, Generation: ${timing.generationMs || 0}ms`}>
            {timing.totalMs}ms
          </span>
        )}
      </div>

      <div className="ai-sources-grid">
        {sources.map((source, index) => {
          const scorePercent = source.score !== undefined
            ? Math.round(Number(source.score) * 100)
            : (source.similarity !== undefined ? Math.round(Number(source.similarity) * 100) : null);

          return (
            <div key={`${source.problemId || index}-${index}`} className="ai-source-chip">
              <Link2 size={11} className="source-link-icon" />
              <span className="source-name">
                #{source.problemId} {source.title || 'DSA Knowledge'}
              </span>
              {source.topic && (
                <span className="source-topic-tag">{source.topic}</span>
              )}
              {scorePercent !== null && (
                <span className="source-similarity-badge">
                  {scorePercent}% match
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
