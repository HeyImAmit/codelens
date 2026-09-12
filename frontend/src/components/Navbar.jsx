import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, Sparkles, Menu, X, BookOpen, Clock, User, Code2 } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isProblemsActive = location.pathname === '/' || location.pathname.startsWith('/problems');

  return (
    <header className="navbar-header glass-panel">
      <div className="container navbar-container">
        {/* Brand / Logo */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon-wrapper">
            <Code2 className="brand-icon" size={20} />
            <Sparkles className="brand-sparkle" size={12} />
          </div>
          <span className="brand-name">
            Code<span className="brand-highlight">Lens</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav desktop-only">
          <Link
            to="/problems"
            className={`nav-link ${isProblemsActive ? 'active' : ''}`}
          >
            <Terminal size={16} />
            <span>Problems</span>
          </Link>

          <div className="nav-link disabled-link" title="Learn platform coming in future milestone">
            <BookOpen size={16} />
            <span>Learn</span>
            <span className="nav-tag">Soon</span>
          </div>

          <div className="nav-link disabled-link" title="Submissions history coming in future milestone">
            <Clock size={16} />
            <span>Submissions</span>
            <span className="nav-tag">Soon</span>
          </div>
        </nav>

        {/* Right Section: AI Status & User Profile */}
        <div className="navbar-right desktop-only">
          <div className="ai-status-badge" title="AI Review Engine ready">
            <span className="ai-status-dot"></span>
            <Sparkles size={13} className="ai-badge-icon" />
            <span className="ai-status-text">AI Review</span>
          </div>

          <div className="user-avatar" title="User Profile">
            <User size={18} />
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-menu-toggle mobile-only"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu glass-panel mobile-only">
          <nav className="mobile-nav-links">
            <Link
              to="/problems"
              className={`mobile-nav-link ${isProblemsActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Terminal size={18} />
              <span>Problems</span>
            </Link>

            <div className="mobile-nav-link disabled-link">
              <BookOpen size={18} />
              <span>Learn</span>
              <span className="nav-tag">Soon</span>
            </div>

            <div className="mobile-nav-link disabled-link">
              <Clock size={18} />
              <span>Submissions</span>
              <span className="nav-tag">Soon</span>
            </div>
          </nav>

          <div className="mobile-nav-footer">
            <div className="ai-status-badge">
              <span className="ai-status-dot"></span>
              <Sparkles size={14} className="ai-badge-icon" />
              <span>AI Code Review • Active</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
