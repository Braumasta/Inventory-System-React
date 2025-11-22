import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

// Simple professional-looking icons using SVG
const SunIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="4" />
    <line x1="12" y1="20" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
    <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="4" y2="12" />
    <line x1="20" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
    <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
  </svg>
);

const MoonIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79z" />
  </svg>
);

const Navbar = ({ theme, onThemeChange, user, onSignOut }) => {
  const location = useLocation();

  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);

  const isOnInventory = location.pathname.startsWith('/inventory');
  const isOnAdmin = location.pathname.startsWith('/admin');

  const toggleTheme = () => {
    onThemeChange(theme === 'light' ? 'dark' : 'light');
  };

  const handleSignOutClick = () => {
    onSignOut();
    setProfileOpen(false);
    setMobileOpen(false);
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/" className="brand-link">
          <div className="logo-placeholder">
            {/* Replace with your logo later */}
            LOGO
          </div>
          <div className="brand-text">
            <span className="brand-title">InventorySphere</span>
            <span className="brand-subtitle">Multi-tenant inventory for teams</span>
          </div>
        </Link>
      </div>

      <div className="navbar-right">
        {/* Desktop nav links */}
        <nav className="nav-links">
          <Link to="/about" className="nav-link">
            About
          </Link>
          <Link to="/contact" className="nav-link">
            Contact
          </Link>

          {user && (
            <Link
              to="/inventory"
              className="nav-link"
              style={isOnInventory ? { fontWeight: 600 } : {}}
            >
              Inventory
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="nav-link"
              style={isOnAdmin ? { fontWeight: 600 } : {}}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Desktop theme toggle (icon only, no dropdown) */}
        <button
          className="icon-button theme-toggle-button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Desktop auth section (hidden on mobile via CSS) */}
        <div className="auth-section">
          {user ? (
            <div className="nav-dropdown-wrapper">
              <div
                className="avatar"
                title={user.name}
                onClick={() => setProfileOpen((prev) => !prev)}
              >
                {initials}
              </div>
              {isProfileOpen && (
                <div className="dropdown-menu dropdown-menu-right">
                  <div className="dropdown-header">
                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                    <div className="dropdown-subtitle">{user.email}</div>
                    <div className="dropdown-badge">
                      {user.role === 'admin' ? 'Admin' : 'Employee'}
                    </div>
                  </div>

                  {user?.role === 'admin' ? (
                    <>
                      <Link
                        to="/admin"
                        className="dropdown-item"
                        onClick={() => setProfileOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/inventory"
                        className="dropdown-item"
                        onClick={() => setProfileOpen(false)}
                      >
                        Inventory
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/inventory"
                      className="dropdown-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      Inventory
                    </Link>
                  )}

                  <button className="dropdown-item danger" onClick={handleSignOutClick}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="btn-primary nav-button-link">
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-toggle"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileOpen && (
        <div className="nav-mobile">
          <Link to="/about" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
            About
          </Link>
          <Link to="/contact" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
            Contact
          </Link>

          {user && (
            <Link
              to="/inventory"
              className="nav-mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              Inventory
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="nav-mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </Link>
          )}

          {/* Theme inside collapsible menu on mobile */}
          <button
            type="button"
            className="nav-mobile-link"
            onClick={() => {
              toggleTheme();
            }}
          >
            {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          </button>

          {/* Auth inside mobile menu */}
          {!user ? (
            <Link to="/auth" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
              Sign in
            </Link>
          ) : (
            <button className="nav-mobile-button danger" onClick={handleSignOutClick}>
              Sign out
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
