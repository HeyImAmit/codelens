import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Sparkles, HelpCircle, RotateCcw, BookOpen } from 'lucide-react';
import { askTutor } from '../../services/api';
import AILoading from './AILoading';
import AISourceList from './AISourceList';
import './TutorInput.css';

const QUICK_PROMPTS = [
  'What is the core algorithmic intuition?',
  'What are the critical edge cases?',
  'How can I optimize the space complexity?',
  'Why does brute force fail on large inputs?',
];

export default function TutorInput({ problemTitle = '', problemTopic = 'DSA' }) {
  const [query, setQuery] = useState('');
  const [activeQA, setActiveQA] = useState(null); // { question, answer, sources, timing }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e, customQuery = null) => {
    if (e && e.preventDefault) e.preventDefault();

    const targetQuery = (customQuery || query).trim();
    if (!targetQuery || loading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    // If query is very short/generic, augment context with problem title
    const contextualQuery = targetQuery.toLowerCase().includes(problemTitle?.toLowerCase() || '')
      ? targetQuery
      : `Regarding "${problemTitle || 'this problem'}" (${problemTopic || 'DSA'}): ${targetQuery}`;

    try {
      const response = await askTutor({
        query: contextualQuery,
        topK: 3,
        signal: controller.signal,
      });

      if (!isMountedRef.current) return;

      if (response && response.success && response.answer) {
        setActiveQA({
          question: targetQuery,
          answer: response.answer,
          sources: response.sources || [],
          timing: response.timing || null,
        });
        setQuery('');
        setError(null);
      } else {
        throw new Error('Received invalid response from AI Tutor service.');
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.isAborted) {
        return;
      }
      if (isMountedRef.current) {
        setError(err.message || 'Failed to get answer from AI Tutor. Please try again.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  const handleQuickPrompt = (promptText) => {
    setQuery(promptText);
    handleSubmit(null, promptText);
  };

  const handleReset = () => {
    setActiveQA(null);
    setQuery('');
    setError(null);
  };

  return (
    <div className="tutor-container">
      {/* State 1: Active Q&A Answer Display */}
      {activeQA && !loading && (
        <div className="tutor-qa-view">
          {/* User Question Block */}
          <div className="tutor-user-query-box">
            <div className="query-tag-row">
              <MessageSquare size={13} className="query-icon" />
              <span>Your Question:</span>
            </div>
            <p className="user-query-text">{activeQA.question}</p>
          </div>

          {/* Tutor Answer Box */}
          <div className="tutor-answer-box">
            <div className="answer-header-row">
              <div className="answer-title-group">
                <Sparkles size={14} className="tutor-brand-icon" />
                <h5>CodeLens DSA Tutor</h5>
              </div>
              <button
                className="tutor-new-question-btn"
                onClick={handleReset}
                title="Ask a different question"
                aria-label="Ask new question"
              >
                <RotateCcw size={12} />
                <span>New Question</span>
              </button>
            </div>
            <div className="answer-markdown-content">
              {activeQA.answer.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Grounded Knowledge Sources */}
            <AISourceList sources={activeQA.sources} timing={activeQA.timing} />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <AILoading
          message="Consulting CodeLens Knowledge Base..."
          subtext="Retrieving relevant algorithmic context and generating grounded tutor guidance..."
        />
      )}

      {/* Error Banner */}
      {error && !loading && (
        <div className="tutor-error-banner" role="alert">
          <p>{error}</p>
          <button className="tutor-retry-btn" onClick={(e) => handleSubmit(e)}>
            Retry
          </button>
        </div>
      )}

      {/* Input Form & Quick Starters (shown when not viewing an answer or after reset) */}
      {(!activeQA || loading) && (
        <div className="tutor-prompt-section">
          <form className="tutor-input-form" onSubmit={handleSubmit}>
            <div className="tutor-input-wrapper">
              <HelpCircle size={15} className="input-search-icon" />
              <input
                type="text"
                className="tutor-text-input"
                placeholder={`Ask about ${problemTitle || 'this problem'} (e.g. intuition, edge cases, complexity)...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                aria-label="Ask question to AI tutor"
                maxLength={400}
              />
              <button
                type="submit"
                className="tutor-send-btn"
                disabled={loading || !query.trim()}
                title="Send question to AI tutor"
                aria-label="Send question"
              >
                <Send size={13} />
              </button>
            </div>
          </form>

          {/* Quick Starter Chips */}
          <div className="quick-prompts-row">
            <span className="quick-prompts-label">Suggestions:</span>
            <div className="quick-prompts-list">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-prompt-chip"
                  onClick={() => handleQuickPrompt(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
