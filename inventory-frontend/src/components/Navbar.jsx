import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ theme, onToggleTheme, isAuthenticated, onSignIn, onSignOut }) => {
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="logo-placeholder">
          {/* You can replace this with your actual logo image later */}
          LOGO
        </div>
        <div className="brand-text">
          <span className="brand-title">InventorySphere</span>
          <span className="brand-subtitle">Multi-tenant inventory for teams</span>
        </div>
      </div>

      <div className="navbar-right">
        <nav className="nav-links">
          <a href="#about" className="nav-link">
            About
          </a>
          <a href="#contact" className="nav-link">
            Contact
          </a>
          <Link to={isAdminPage ? '/' : '/admin'} className="nav-link">
            {isAdminPage ? 'Landing' : 'Admin'}
          </Link>
        </nav>

        <button className="theme-toggle" onClick={onToggleTheme}>
          <span>{theme === 'light' ? '🌞' : '🌙'}</span>
          <span>{theme === 'light' ? 'Light' : 'Dark'}</span>
        </button>

        <div className="auth-section">
          {isAuthenticated ? (
            <>
              <div
                className="avatar"
                title="User profile (placeholder)"
              >
                U
              </div>
              <button className="btn-ghost" onClick={onSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={onSignIn}>
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
