import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ theme, onThemeChange, user, onSignIn, onSignOut }) => {
  const location = useLocation();

  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isThemeOpen, setThemeOpen] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);

  const isOnInventory = location.pathname.startsWith('/inventory');
  const isOnAdmin = location.pathname.startsWith('/admin');

  const handleThemeSelect = (mode) => {
    onThemeChange(mode);
    setThemeOpen(false);
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
        <div className="logo-placeholder">
          {/* Replace with your logo image later */}
          LOGO
        </div>
        <div className="brand-text">
          <span className="brand-title">InventorySphere</span>
          <span className="brand-subtitle">Multi-tenant inventory for teams</span>
        </div>
      </div>

      {/* Desktop links */}
      <div className="navbar-right">
        <nav className="nav-links">
          <a href="#about" className="nav-link">
            About
          </a>
          <a href="#contact" className="nav-link">
            Contact
          </a>

          {/* Show Inventory only when logged in */}
          {user && (
            <Link
              to="/inventory"
              className="nav-link"
              style={isOnInventory ? { fontWeight: 600 } : {}}
            >
              Inventory
            </Link>
          )}

          {/* Show Dashboard only for admins and only when logged in */}
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

        {/* Theme button with dropdown */}
        <div className="nav-dropdown-wrapper">
          <button
            className="icon-button"
            onClick={() => {
              setThemeOpen((prev) => !prev);
              setProfileOpen(false);
            }}
            aria-label="Theme settings"
          >
            {theme === 'light' ? '🌞' : '🌙'}
          </button>
          {isThemeOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">Theme</div>
              <button
                className={`dropdown-item ${theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeSelect('light')}
              >
                Light
              </button>
              <button
                className={`dropdown-item ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeSelect('dark')}
              >
                Dark
              </button>
            </div>
          )}
        </div>

        {/* Auth section */}
        <div className="auth-section">
          {user ? (
            <div className="nav-dropdown-wrapper">
              <div
                className="avatar"
                title={user.name}
                onClick={() => {
                  setProfileOpen((prev) => !prev);
                  setThemeOpen(false);
                }}
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

                  {/* Links depend on role */}
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
            <button className="btn-primary" onClick={onSignIn}>
              Sign in
            </button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="nav-toggle"
          onClick={() => {
            setMobileOpen((prev) => !prev);
            setProfileOpen(false);
            setThemeOpen(false);
          }}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {isMobileOpen && (
        <div className="nav-mobile">
          <a href="#about" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
            About
          </a>
          <a href="#contact" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
            Contact
          </a>

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

          {!user ? (
            <button
              className="nav-mobile-button"
              onClick={() => {
                onSignIn();
                setMobileOpen(false);
              }}
            >
              Sign in
            </button>
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

