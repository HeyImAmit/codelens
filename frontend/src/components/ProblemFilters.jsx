import React from 'react';
import { Search, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
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
    <div className="problem-filters-section">
      {/* Section Header */}
      <div className="filters-header">
        <div className="filters-header-title">
          <h2>Problems Catalog</h2>
          <span className="count-tag">
            {filteredCount} {filteredCount === 1 ? 'problem' : 'problems'}
            {isFiltered && <span className="total-indicator"> (of {totalCount})</span>}
          </span>
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="filters-controls-row">
        {/* Search Bar */}
        <div className="filter-control search-wrapper">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search problems by title or keyword"
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search input"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Difficulty Filter Tabs */}
        <div className="filter-control difficulty-tabs" role="group" aria-label="Filter by difficulty">
          {difficulties.map((diff) => (
            <button
              key={diff.value}
              className={`diff-tab-btn ${selectedDifficulty === diff.value ? 'active' : ''} ${diff.value.toLowerCase()}`}
              onClick={() => setSelectedDifficulty(diff.value)}
            >
              {diff.label}
            </button>
          ))}
        </div>

        {/* Topic Filter Dropdown */}
        <div className="filter-control topic-wrapper">
          <SlidersHorizontal size={14} className="topic-icon" />
          <select
            className="topic-select"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            aria-label="Filter by topic"
          >
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        {isFiltered && (
          <button
            className="filter-reset-btn"
            onClick={onResetFilters}
            title="Reset active filters"
            aria-label="Reset all filters"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
