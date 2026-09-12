import React from 'react';
import { Search, X, Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';
import './ProblemFilters.css';

export default function ProblemFilters({
  searchQuery,
  setSearchQuery,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedTopic,
  setSelectedTopic,
  totalCount,
  filteredCount,
  onResetFilters,
}) {
  const difficulties = [
    { label: 'All', value: 'ALL' },
    { label: 'Easy', value: 'Easy' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Hard', value: 'Hard' },
  ];

  const topics = [
    'All Topics',
    'Arrays & Hashing',
    'Two Pointers',
    'Stack & Queue',
    'Trees & Graphs',
    'Dynamic Programming',
  ];

  const isFiltered = searchQuery.trim() !== '' || selectedDifficulty !== 'ALL' || selectedTopic !== 'All Topics';

  return (
    <div className="problem-filters-container">
      {/* Header Section */}
      <div className="filters-header">
        <div>
          <h2 className="section-title">Problems</h2>
          <p className="section-subtitle">
            Choose a problem and start solving with AI assistance.
          </p>
        </div>
        <div className="results-badge glass-panel">
          Showing <span className="highlight-count">{filteredCount}</span> of {totalCount}
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="controls-row">
        {/* Search Bar */}
        <div className="search-box-wrapper glass-panel">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search problems by title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Difficulty Filter Tabs */}
        <div className="difficulty-tabs glass-panel">
          {difficulties.map((diff) => (
            <button
              key={diff.value}
              className={`diff-tab ${selectedDifficulty === diff.value ? 'active' : ''} ${diff.value.toLowerCase()}`}
              onClick={() => setSelectedDifficulty(diff.value)}
            >
              {diff.label}
            </button>
          ))}
        </div>

        {/* Topic Filter Dropdown */}
        <div className="topic-select-wrapper glass-panel">
          <SlidersHorizontal size={15} className="topic-icon" />
          <select
            className="topic-select"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button (only shown if filters active) */}
        {isFiltered && (
          <button
            className="reset-filters-btn"
            onClick={onResetFilters}
            title="Reset filters"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
