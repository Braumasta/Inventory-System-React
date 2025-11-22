import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import AdminDashboard from './pages/AdminDashboard';
import InventoryPage from './pages/InventoryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ForgotPasswordPage from "./pages/ForgotPasswordPage";


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
  const [user, setUser] = useState(null); // { name, email, role } | null

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme);
  };

  const handleSignIn = (userData) => {
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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

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
