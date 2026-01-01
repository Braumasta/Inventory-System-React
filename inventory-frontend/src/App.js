import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  setToken as storeToken,
  clearToken as removeToken,
  getToken as loadToken,
  fetchMe,
} from "./api";

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
import PurchaseHistory from "./pages/PurchaseHistory";
import InventoryHistory from "./pages/InventoryHistory";

function ProtectedRoute({ user, requiredRole, loading, children }) {
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}
function App() {
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Load theme from localStorage & apply to document on first mount
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const initial = stored === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);

    // Load auth from storage
    const savedUser = localStorage.getItem("authUser");
    const savedToken = loadToken();
    if (savedToken) {
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      }
      fetchMe()
        .then((me) => {
          setUser(me);
          localStorage.setItem("authUser", JSON.stringify(me));
        })
        .catch(() => {
          handleSignOut();
        })
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  // Whenever theme changes, update <html data-theme="..."> and localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme);
  };

  const handleSignIn = ({ user: userData, token: tokenValue }) => {
    if (tokenValue) {
      storeToken(tokenValue);
    }
    if (userData) {
      setUser(userData);
      localStorage.setItem("authUser", JSON.stringify(userData));
    }
  };

  const handleSignOut = () => {
    setUser(null);
    removeToken();
    localStorage.removeItem("authUser");
    setAuthLoading(false);
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
              <ProtectedRoute user={user} loading={authLoading}>
                <AccountDetails user={user} onUpdateUser={handleUpdateUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/security"
            element={
              <ProtectedRoute user={user} loading={authLoading}>
                <AccountSecurity user={user} />
              </ProtectedRoute>
            }
          />

          {/* Admin dashboard: temporarily open to any signed-in user for showcase */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} loading={authLoading}>
                <AdminDashboard user={user} />
              </ProtectedRoute>
            }
          />

          {/* Inventory: accessible for both roles, with role-based behavior */}
          <Route
            path="/inventory"
            element={
              <ProtectedRoute user={user} loading={authLoading}>
               <InventoryPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory-history"
            element={
              <ProtectedRoute user={user} loading={authLoading}>
                <InventoryHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/purchase-history"
            element={
              <ProtectedRoute user={user} loading={authLoading}>
                <PurchaseHistory />
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
