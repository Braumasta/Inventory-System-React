import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/AuthPage.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) return;

    // Later: call backend to send 6-digit code to this email.
    setSubmitted(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Forgot password</h1>
          <p className="auth-subtitle">
            Enter the email address associated with your account and we&apos;ll
            send you a 6-digit code to reset your password.
          </p>
        </div>

        {!submitted ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label className="form-label" htmlFor="reset-email">
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary auth-submit-btn">
              Send reset code
            </button>

            <div className="auth-footer-row auth-footer-row--center">
              <span>Remembered your password?</span>
              <Link to="/auth" className="auth-footer-link">
                Back to sign in
              </Link>
            </div>
          </form>
        ) : (
          <div className="auth-success">
            <p>
              If an account exists for <strong>{email}</strong>, a 6-digit code
              will be sent to that email address.
            </p>
            <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
              You&apos;ll use that code on the reset screen (to be implemented
              later) to choose a new password.
            </p>

            <div
              className="auth-footer-row auth-footer-row--center"
              style={{ marginTop: "1.25rem" }}
            >
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

export default ForgotPasswordPage;
