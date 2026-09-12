import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, Menu, X, BookOpen, Clock, User, Code2 } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isProblemsActive = location.pathname === '/' || location.pathname.startsWith('/problems');

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Brand / Logo */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon-wrapper">
            <Code2 className="brand-icon" size={18} />
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
            <Terminal size={15} />
            <span>Problems</span>
          </Link>

          <div className="nav-link disabled-link" title="Curriculum coming soon">
            <BookOpen size={15} />
            <span>Learn</span>
            <span className="nav-tag">Soon</span>
          </div>

          <div className="nav-link disabled-link" title="Submissions history coming soon">
            <Clock size={15} />
            <span>Submissions</span>
            <span className="nav-tag">Soon</span>
          </div>
        </nav>

        {/* Right Section: Sandbox & Profile */}
        <div className="navbar-right desktop-only">
          <div className="engine-status-pill" title="Execution engine active">
            <span className="status-dot"></span>
            <span className="status-text">Docker Sandbox</span>
          </div>

          <div className="user-avatar" title="User Profile">
            <User size={15} />
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-menu-toggle mobile-only"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu mobile-only">
          <nav className="mobile-nav-links">
            <Link
              to="/problems"
              className={`mobile-nav-link ${isProblemsActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Terminal size={16} />
              <span>Problems</span>
            </Link>

            <div className="mobile-nav-link disabled-link">
              <BookOpen size={16} />
              <span>Learn</span>
              <span className="nav-tag">Soon</span>
            </div>

            <div className="mobile-nav-link disabled-link">
              <Clock size={16} />
              <span>Submissions</span>
              <span className="nav-tag">Soon</span>
            </div>
          </nav>

          <div className="mobile-nav-footer">
            <div className="engine-status-pill">
              <span className="status-dot"></span>
              <span>Docker Sandbox Active</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
