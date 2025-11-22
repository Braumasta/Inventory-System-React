import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [theme, setTheme] = useState('light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleSignIn = () => {
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
  };

  return (
    <div className="app">
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        isAuthenticated={isAuthenticated}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
