import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getProblems } from '../services/api';
import HeroHeader from '../components/HeroHeader';
import ProblemStats from '../components/ProblemStats';
import ProblemFilters from '../components/ProblemFilters';
import ProblemCard from '../components/ProblemCard';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import './ProblemsPage.css';

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');

  // Fetch problems function
  const fetchProblemsList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProblems();
      setProblems(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProblemsList();
  }, [fetchProblemsList]);

  // Client-side filtering
  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      // 1. Search Query filter (title or description)
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = problem.title.toLowerCase().includes(q);
      const descMatch = (problem.description || '').toLowerCase().includes(q);
      const searchMatches = !q || titleMatch || descMatch;

      // 2. Difficulty Filter
      const diffMatches =
        selectedDifficulty === 'ALL' ||
        String(problem.difficulty).toLowerCase() === selectedDifficulty.toLowerCase();

      // 3. Topic Filter (placeholder logic)
      const topicMatches = selectedTopic === 'All Topics';

      return searchMatches && diffMatches && topicMatches;
    });
  }, [problems, searchQuery, selectedDifficulty, selectedTopic]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDifficulty('ALL');
    setSelectedTopic('All Topics');
  };

  return (
    <div className="problems-page">
      {/* Hero Header */}
      <HeroHeader />

      {/* Main Content Area */}
      <div className="container main-content-container">
        {/* Dynamic Problem Stats */}
        <ProblemStats problems={problems} />

        {/* Filter Controls */}
        <ProblemFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          selectedTopic={selectedTopic}
          setSelectedTopic={setSelectedTopic}
          totalCount={problems.length}
          filteredCount={filteredProblems.length}
          onResetFilters={handleResetFilters}
        />

        {/* Problem List Display */}
        <div className="problems-list-wrapper">
          {loading && <SkeletonLoader count={4} />}

          {!loading && error && (
            <ErrorState error={error} onRetry={fetchProblemsList} />
          )}

          {!loading && !error && filteredProblems.length === 0 && (
            <EmptyState onReset={handleResetFilters} />
          )}

          {!loading && !error && filteredProblems.length > 0 && (
            <div className="problems-grid" role="list">
              {filteredProblems.map((problem) => (
                <ProblemCard key={problem.id} problem={problem} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
