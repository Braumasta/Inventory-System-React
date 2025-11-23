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
import AccountDetails from "./pages/AccountDetails";
import AccountSecurity from "./pages/AccountSecurity";

function ProtectedRoute({ user, requiredRole, children }) {
  // Prevent rendering children until user is known
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
function App() {
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);

  // Load theme from localStorage & apply to document on first mount
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const initial = stored === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  // Whenever theme changes, update <html data-theme="..."> and localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
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

  const handleUpdateUser = (updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
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

          <Route path="/auth" element={<AuthPage onSignIn={handleSignIn} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute user={user}>
                <AccountDetails user={user} onUpdateUser={handleUpdateUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/security"
            element={
              <ProtectedRoute user={user}>
                <AccountSecurity user={user} />
              </ProtectedRoute>
            }
          />

          {/* Admin dashboard: temporarily open to any signed-in user for showcase */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user}>
                <AdminDashboard user={user} />
              </ProtectedRoute>
            }
          />

          {/* Inventory: accessible for both roles, with role-based behavior */}
          <Route
            path="/inventory"
            element={
              <ProtectedRoute user={user}>
               <InventoryPage user={user} />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
