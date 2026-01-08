import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/AuthPage.css";
import { resetPassword } from "../api";

const ResetPasswordPage = () => {
  const location = useLocation();
  const email = location.state?.email || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required to reset your password.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await resetPassword(email, password);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Could not reset password.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Reset password</h1>
          <p className="auth-subtitle">
            {email ? `Reset password for ${email}.` : "Enter a new password below."}
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {!submitted ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label className="form-label" htmlFor="reset-password">
                New password
              </label>
              <div className="password-row">
                <input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "View"}
                </button>
              </div>
            </div>
            <div className="form-row">
              <label className="form-label" htmlFor="reset-confirm-password">
                Confirm password
              </label>
              <div className="password-row">
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? "Hide" : "View"}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary auth-submit-btn">
              Reset password
            </button>
          </form>
        ) : (
          <div className="auth-success">
            <p>Your password has been reset. You can sign in now.</p>
            <div className="auth-footer-row auth-footer-row--center">
              <Link to="/auth" className="auth-footer-link">
                Back to sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
