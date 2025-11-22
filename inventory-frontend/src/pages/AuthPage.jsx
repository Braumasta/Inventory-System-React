import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthPage.css';

const AuthPage = ({ onSignIn }) => {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const navigate = useNavigate();

  // Sign in state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign up state
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');
  const [passwordHint, setPasswordHint] = useState('');

  const passwordIsStrong = (pwd) => {
    const minLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasDigit = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    return {
      minLength,
      hasUpper,
      hasLower,
      hasDigit,
      hasSpecial,
      ok: minLength && hasUpper && hasLower && hasDigit && hasSpecial,
    };
  };

  const handleSignupPasswordChange = (value) => {
    setSignupPassword(value);

    const check = passwordIsStrong(value);
    const missing = [];
    if (!check.minLength) missing.push('8+ characters');
    if (!check.hasUpper) missing.push('uppercase letter');
    if (!check.hasLower) missing.push('lowercase letter');
    if (!check.hasDigit) missing.push('number');
    if (!check.hasSpecial) missing.push('symbol');

    setPasswordHint(
      missing.length
        ? `Password must include: ${missing.join(', ')}`
        : 'Password strength: Good ✅'
    );
  };

  const handleSignInSubmit = (e) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      alert('Please enter your email and password.');
      return;
    }

    // Demo logic: email including "admin" => admin role
    const isAdmin = loginEmail.toLowerCase().includes('admin');

    const mockUser = {
      name: isAdmin ? 'Admin User' : 'Employee User',
      email: loginEmail,
      role: isAdmin ? 'admin' : 'employee',
    };

    onSignIn(mockUser);

    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/inventory');
    }
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !dob || !signupEmail || !signupPassword) {
      alert('Please fill in all required fields.');
      return;
    }

    if (signupPassword !== signupPasswordConfirm) {
      alert('Passwords do not match.');
      return;
    }

    const check = passwordIsStrong(signupPassword);
    if (!check.ok) {
      alert('Password is not strong enough. Please follow the requirements.');
      return;
    }

    console.log('New signup:', {
      firstName,
      middleName,
      lastName,
      dob,
      email: signupEmail,
    });

    alert('Account created (frontend demo only).');
    setMode('signin');
    setLoginEmail(signupEmail);
  };

  const handleForgotPassword = () => {
    alert('Forgot password flow will be implemented on the backend (reset link, etc.).');
  };

  return (
    <div className="auth-shell">
      <div className="auth-card-grid">
        {/* Left column (brand / description) */}
        <div className="auth-side">
          <div className="auth-badge">InventorySphere</div>
          <h1 className="auth-main-title">Sign in to your inventory</h1>
          <p className="auth-main-text">
            A role-based, multi-tenant inventory system. Admins control structure and access.
            Employees update stock securely using barcodes.
          </p>

          <div className="auth-meta">
            <div>
              <div className="auth-meta-label">For admins</div>
              <div className="auth-meta-value">Dashboard, employees, inventory schema</div>
            </div>
            <div>
              <div className="auth-meta-label">For employees</div>
              <div className="auth-meta-value">View & update product quantities</div>
            </div>
          </div>

          <div className="auth-meta-note">
            This screen is built to look good on laptops, tablets and phones—resize the window to
            see it adapt.
          </div>
        </div>

        {/* Right column (forms) */}
        <div className="auth-panel-card">
          <div className="auth-panel-header">
            <div className="auth-tabs">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`pill-tab ${mode === 'signin' ? 'pill-tab-active' : ''}`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`pill-tab ${mode === 'signup' ? 'pill-tab-active' : ''}`}
              >
                Sign up
              </button>
            </div>
          </div>

          {mode === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="auth-form">
              <div>
                <label className="input-label">Email address</label>
                <input
                  className="input-field"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="input-label">Password</label>
                <input
                  className="input-field"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <div className="auth-footer-row">
                  <button
                    type="button"
                    className="inline-link"
                    onClick={handleForgotPassword}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary auth-submit-btn">
                Sign in
              </button>

              <div className="auth-small-note">
                Demo: if your email contains <strong>"admin"</strong>, you&apos;ll be logged in
                as an admin. Later this will use real credentials checked by the backend.
              </div>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="auth-form">
              <div className="grid-3-responsive">
                <div>
                  <label className="input-label">First name *</label>
                  <input
                    className="input-field"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Middle name</label>
                  <input
                    className="input-field"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="Middle name"
                  />
                </div>
                <div>
                  <label className="input-label">Last name *</label>
                  <input
                    className="input-field"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Date of birth *</label>
                <input
                  className="input-field"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="input-label">Email address *</label>
                <input
                  className="input-field"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="input-label">Password *</label>
                <input
                  className="input-field"
                  type="password"
                  value={signupPassword}
                  onChange={(e) => handleSignupPasswordChange(e.target.value)}
                  placeholder="Use a strong password"
                  required
                />
              </div>

              <div>
                <label className="input-label">Confirm password *</label>
                <input
                  className="input-field"
                  type="password"
                  value={signupPasswordConfirm}
                  onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                  placeholder="Re-type your password"
                  required
                />
              </div>

              {passwordHint && <div className="auth-small-note">{passwordHint}</div>}

              <button type="submit" className="btn-primary auth-submit-btn">
                Create account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
