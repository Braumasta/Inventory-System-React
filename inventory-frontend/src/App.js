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
import InventoryPage from "./pages/InventoryPage";

function App() {
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);

  // Apply theme to <html data-theme="...">
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
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
        onToggleTheme={handleToggleTheme}
        user={user}
        onSignOut={handleSignOut}
      />

      <main className="app-main">
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            <Route path="/auth" element={<AuthPage onSignIn={handleSignIn} />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Admin-only dashboard */}
            <Route
              path="/admin"
              element={
                user && user.role === "admin" ? (
                  <AdminDashboard user={user} />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />

            {/* Inventory page: any logged-in user */}
            <Route
              path="/inventory"
              element={
                user ? (
                  <InventoryPage user={user} />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
