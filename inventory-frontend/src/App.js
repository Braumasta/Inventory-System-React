import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AuthPage from "./pages/AuthPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [theme, setTheme] = useState("light"); // 'light' | 'dark'
  const [user, setUser] = useState(null); // { name, email, role }

  // Attach theme to <html> so [data-theme='dark'] works
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
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

          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route
            path="/auth"
            element={<AuthPage onSignIn={handleSignIn} />}
          />

          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Admin dashboard – only for admins */}
          <Route
            path="/admin"
            element={
              user?.role === "admin" ? (
                <AdminDashboard user={user} />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          {/* Inventory – TEMP: show AdminDashboard for employees too */}
          <Route
            path="/inventory"
            element={
              user ? (
                <AdminDashboard user={user} />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          {/* Fallback 404 */}
          <Route
            path="*"
            element={
              <div className="container">
                <h1>Page not found</h1>
                <p>The page you are looking for does not exist.</p>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
