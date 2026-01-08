import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/AuthPage.css";
import { login, register } from "../api";

const AuthPage = ({ onSignIn }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'

  // Sign in state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign up state
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);

  const [error, setError] = useState("");

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setError("");
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!signInEmail.trim() || !signInPassword.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    try {
      const resp = await login(signInEmail, signInPassword);
      if (typeof onSignIn === "function") {
        onSignIn({ user: resp.user, token: resp.token });
      }
      navigate("/inventory");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please fill in your first and last name.");
      return;
    }

    if (!signUpEmail.trim()) {
      setError("Please enter an email address.");
      return;
    }

    if (signUpPassword.length < 8) {
      setError("Password should be at least 8 characters for better security.");
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const resp = await register({
        firstName,
        middleName,
        lastName,
        dob,
        email: signUpEmail,
        password: signUpPassword,
      });
      if (typeof onSignIn === "function") {
        onSignIn({ user: resp.user, token: resp.token });
      }
      navigate("/inventory");
    } catch (err) {
      setError(err.message || "Sign up failed");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card-grid">
        {/* Left side info panel */}
        <section className="auth-side">
          <div className="auth-badge">
            InventorySphere • Secure workspace
          </div>

          <h1 className="auth-main-title">
            One inventory hub for your whole organization.
          </h1>

          <p className="auth-main-text">
            Teams can define locations and categories while keeping everyone in
            sync on real-time stock updates using barcode scanning and quick
            quantity controls.
          </p>

          <div className="auth-meta">
            <div>
              <div className="auth-meta-label">Multi-tenant</div>
              <div className="auth-meta-value">
                Each account gets an isolated inventory workspace.
              </div>
            </div>
            <div>
              <div className="auth-meta-label">Shared access</div>
              <div className="auth-meta-value">
                Keep inventory structure and daily updates in one workspace.
              </div>
            </div>
            <div className="auth-meta-note">
              Reset passwords, invite teammates, and manage data from a single
              dashboard.
            </div>
          </div>
        </section>

        {/* Right side auth panel */}
        <section className="auth-panel-card">
          <div className="auth-panel-header">
            <div>
              <h2 className="auth-main-title" style={{ fontSize: "1.2rem" }}>
                {mode === "signin"
                  ? "Sign in to your workspace"
                  : "Create your account"}
              </h2>
              <p className="auth-small-note">
                {mode === "signin"
                  ? "Use your organization email to access inventory."
                  : "Use a valid email so we can verify your account later."}
              </p>
            </div>

            {/* Tabs: Sign in / Sign up */}
            <div className="auth-tabs">
              <button
                type="button"
                className={
                  "pill-tab " + (mode === "signin" ? "pill-tab-active" : "")
                }
                onClick={() => handleModeChange("signin")}
              >
                Sign in
              </button>
              <button
                type="button"
                className={
                  "pill-tab " + (mode === "signup" ? "pill-tab-active" : "")
                }
                onClick={() => handleModeChange("signup")}
              >
                Sign up
              </button>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {/* Sign in form */}
          {mode === "signin" && (
            <form className="auth-form" onSubmit={handleSignInSubmit}>
              <div className="form-row">
                <label className="form-label" htmlFor="signin-email">
                  Email address
                </label>
                <input
                  id="signin-email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <label className="form-label" htmlFor="signin-password">
                  Password
                </label>
                <div className="password-row">
                  <input
                    id="signin-password"
                    type={showSignInPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Your password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowSignInPassword((prev) => !prev)}
                  >
                    {showSignInPassword ? "Hide" : "View"}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary auth-submit-btn">
                Sign in
              </button>

              <div className="auth-footer-row auth-footer-row--right">
                <Link to="/forgot-password" className="auth-footer-link">
                  Forgot password?
                </Link>
              </div>
            </form>
          )}

          {/* Sign up form */}
          {mode === "signup" && (
            <form className="auth-form" onSubmit={handleSignUpSubmit}>
              <div className="grid-3-responsive">
                <div className="form-row">
                  <label className="form-label" htmlFor="first-name">
                    First name
                  </label>
                  <input
                    id="first-name"
                    type="text"
                    className="form-input"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-row">
                  <label className="form-label" htmlFor="middle-name">
                    Middle name
                  </label>
                  <input
                    id="middle-name"
                    type="text"
                    className="form-input"
                    placeholder="Middle name (optional)"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label" htmlFor="last-name">
                    Last name
                  </label>
                  <input
                    id="last-name"
                    type="text"
                    className="form-input"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <label className="form-label" htmlFor="dob">
                  Date of birth
                </label>
                <input
                  id="dob"
                  type="date"
                  className="form-input"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>

              <div className="form-row">
                <label className="form-label" htmlFor="signup-email">
                  Email address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid-3-responsive">
                <div className="form-row">
                  <label className="form-label" htmlFor="signup-password">
                    Password
                  </label>
                  <div className="password-row">
                    <input
                      id="signup-password"
                      type={showSignUpPassword ? "text" : "password"}
                      className="form-input"
                      placeholder="At least 8 characters"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowSignUpPassword((prev) => !prev)}
                    >
                      {showSignUpPassword ? "Hide" : "View"}
                    </button>
                  </div>
                </div>
                <div className="form-row">
                  <label
                    className="form-label"
                    htmlFor="signup-confirm-password"
                  >
                    Confirm password
                  </label>
                  <div className="password-row">
                    <input
                      id="signup-confirm-password"
                      type={showSignUpConfirmPassword ? "text" : "password"}
                      className="form-input"
                      placeholder="Repeat password"
                      value={signUpConfirmPassword}
                      onChange={(e) =>
                        setSignUpConfirmPassword(e.target.value)
                      }
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowSignUpConfirmPassword((prev) => !prev)}
                    >
                      {showSignUpConfirmPassword ? "Hide" : "View"}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary auth-submit-btn">
                Create account
              </button>

              <p className="auth-small-note">
                Once your account is verified, you can invite teammates and
                manage access from the dashboard.
              </p>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};

export default AuthPage;
