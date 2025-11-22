import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import AdminDashboard from './pages/AdminDashboard';
import InventoryPage from './pages/InventoryPage';

// optional app-level styles (you moved App.css into styles folder)
import './styles/App.css';

const NotAuthorized = ({ message }) => (
  <div className="container" style={{ paddingTop: '2rem' }}>
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Access restricted</h2>
      <p style={{ marginBottom: 0 }}>
        {message || 'You need to be signed in with the correct role to view this page.'}
      </p>
    </div>
  </div>
);

function App() {
  const [theme, setTheme] = useState('light');

  // user = null | { name, email, role }
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme);
  };

  const handleSignIn = (userData) => {
    // userData: { name, email, role }
    setUser(userData);
  };

  const handleSignOut = () => {
    setUser(null);
  };

  return (
    <div className="app">
      <Navbar
        theme={theme}
        onThemeChange={handleThemeChange}
        user={user}
        onSignOut={handleSignOut}
      />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/auth" element={<AuthPage onSignIn={handleSignIn} />} />

          <Route
            path="/inventory"
            element={
              user ? (
                <InventoryPage user={user} />
              ) : (
                <NotAuthorized message="Please sign in to view your inventory." />
              )
            }
          />

          <Route
            path="/admin"
            element={
              user?.role === 'admin' ? (
                <AdminDashboard />
              ) : (
                <NotAuthorized message="You must be signed in as an admin to view the dashboard." />
              )
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
