import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import InventoryPage from './pages/InventoryPage';

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
  // theme: 'light' | 'dark'
  const [theme, setTheme] = useState('light');

  // very simple fake auth for now
  // later this will come from your Node backend & JWT
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme);
  };

  const handleSignIn = () => {
    // For now we just mock an admin login.
    // Later you'll replace this with real auth (login form + API).
    setUser({
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin', // change to 'employee' to test non-admin behaviour
    });
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
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Inventory visible only if logged in (any role) */}
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

          {/* Admin dashboard visible only for role === 'admin' */}
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
