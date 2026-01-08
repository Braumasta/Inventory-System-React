import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/AuthPage.css";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) return;

    navigate("/reset-password", { state: { email } });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Forgot password</h1>
          <p className="auth-subtitle">
            Enter the email address associated with your account to continue
            to the reset flow.
          </p>
        </div>

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
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
