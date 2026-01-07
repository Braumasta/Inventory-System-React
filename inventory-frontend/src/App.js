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
import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/InventoryPage";
import AccountDetails from "./pages/AccountDetails";
import AccountSecurity from "./pages/AccountSecurity";
import PurchaseHistory from "./pages/PurchaseHistory";
import InventoryHistory from "./pages/InventoryHistory";

function ProtectedRoute({ user, loading, children }) {
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}
function App() {
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    const savedToken = loadToken();
    if (!savedToken) {
      setAuthLoading(false);
      return;
    }
    fetchMe()
      .then((me) => {
        const fullName = [me.firstName, me.middleName, me.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        const nextUser = { ...me, name: fullName || me.firstName || me.email };
        setUser(nextUser);
      })
      .catch(() => {
        handleSignOut();
      })
      .finally(() => setAuthLoading(false));
  }, []);

  // Whenever theme changes, update <html data-theme="...">
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme);
  };

  const handleSignIn = ({ user: userData, token: tokenValue }) => {
    if (tokenValue) {
      storeToken(tokenValue);
    }
    if (userData) {
      const fullName = [userData.firstName, userData.middleName, userData.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
      const nextUser = { ...userData, name: fullName || userData.firstName || userData.email };
      setUser(nextUser);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    removeToken();
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

          {/* Dashboard: open to any signed-in user */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user} loading={authLoading}>
                <Dashboard user={user} />
              </ProtectedRoute>
            }
          />

          {/* Inventory */}
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
