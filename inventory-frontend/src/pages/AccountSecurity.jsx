import React, { useEffect, useState } from "react";
import "../styles/AccountSecurity.css";

const AccountSecurity = ({ user }) => {
  const [status, setStatus] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("idle"); // idle | code-sent | ready
  const [statusType, setStatusType] = useState("info"); // info | error | success
  const [statusId, setStatusId] = useState(0); // forces re-render/re-animate status
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [lockdownEnabled, setLockdownEnabled] = useState(false);

  const setStatusMessage = (message, type = "info") => {
    setStatus(message);
    setStatusType(type);
    setStatusId(Date.now());
  };

  const sendCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(code);
    setStep("code-sent");
    setStatusMessage(
      `A 6-digit code was sent to ${user?.email}. (demo code: ${code})`,
      "success"
    );
  };

  const verifyCode = () => {
    if (!codeInput.trim()) {
      setStatusMessage("Please enter the 6-digit code.", "error");
      return;
    }
    if (codeInput.trim() !== sentCode) {
      setStatusMessage("Invalid code. Please check your email and try again.", "error");
      return;
    }
    setStatusMessage("Code verified. You can now set a new password.", "success");
    setStep("ready");
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (step !== "ready") {
      setStatusMessage("Verify the 6-digit code before setting a new password.", "error");
      return;
    }
    if (!newPassword || !confirmPassword) {
      setStatusMessage("Please fill in both password fields.", "error");
      return;
    }
    if (newPassword.length < 8 || confirmPassword.length < 8) {
      setStatusMessage("Password should be at least 8 characters.", "error");
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      setStatusMessage("Passwords do not match.", "error");
      return;
    }
    setStatusMessage("Password updated (demo only).", "success");
    setStep("idle");
    setSentCode("");
    setCodeInput("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  const toggleLockdown = () => {
    setLockdownEnabled((prev) => {
      const next = !prev;
      setStatusMessage(
        next
          ? "Session lockdown enabled. New device logins are blocked (demo)."
          : "Session lockdown disabled. Normal logins restored (demo).",
        next ? "success" : "info"
      );
      return next;
    });
  };

  const confirmDelete = () => {
    setDeleteModalOpen(false);
    setStatusMessage("Account deletion flow would start here (demo only).", "info");
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setStatusMessage("Account deletion canceled.", "info");
  };

  // Auto-clear status after 4 seconds
  useEffect(() => {
    if (!status) return undefined;
    const timer = setTimeout(() => setStatus(""), 4000);
    return () => clearTimeout(timer);
  }, [status, statusId]);

  return (
    <div className="account-page container">
      <header className="account-header">
        <div>
          <h1 className="account-title">Account security</h1>
          <p className="account-subtitle">
            Manage password resets with email verification and review critical actions.
          </p>
        </div>
      </header>

      <div className="security-grid">
        <section className="security-card">
          <div className="security-card-header">
            <div>
              <h2 className="security-card-title">Change password</h2>
              <p className="security-card-subtitle">
                We&apos;ll send a 6-digit code to your email. Enter it to unlock the
                password fields.
              </p>
            </div>
            <button className="btn-primary security-send-btn" onClick={sendCode}>
              Send code
            </button>
          </div>

          <div className="security-form">
            <div className="form-row">
              <label className="account-label" htmlFor="code-input">
                6-digit code
              </label>
              <input
                id="code-input"
                className="account-input"
                placeholder="Enter code"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn-ghost"
              onClick={verifyCode}
              disabled={!sentCode}
            >
              Verify code
            </button>

            <div className="security-divider" />

            <form className="security-password-form" onSubmit={handlePasswordSave}>
              <div className="form-row">
                <label className="account-label" htmlFor="new-password">
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  className="account-input"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="form-row">
                <label className="account-label" htmlFor="confirm-password">
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  className="account-input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary account-save-btn">
                Save new password
              </button>
            </form>
          </div>
        </section>

        <section className="security-card danger-card">
          <div className="security-card-header">
            <div>
              <h2 className="security-card-title">Delete my account</h2>
              <p className="security-card-subtitle">
                This is a destructive action. You&apos;ll be asked to confirm before we proceed.
              </p>
            </div>
          </div>
          <ul className="security-alert-list">
            <li>Revoke all active sessions and API tokens.</li>
            <li>Remove stored personal data from this workspace.</li>
            <li>Loss of access to all admin and inventory tools.</li>
          </ul>
          <button
            className="security-secondary-btn"
            type="button"
            onClick={toggleLockdown}
          >
            {lockdownEnabled ? "Disable session lockdown" : "Enable session lockdown"}
          </button>
          <button className="nav-mobile-button danger security-delete-btn" onClick={handleDelete}>
            Delete my account
          </button>
        </section>
      </div>

      {status && (
        <div
          key={statusId}
          className={`security-status security-status-${statusType}`}
        >
          {status}
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="security-modal-backdrop">
          <div className="security-modal">
            <h3 className="security-modal-title">Delete account</h3>
            <p className="security-modal-text">
              Are you sure you want to delete your account? This cannot be undone in a real system.
            </p>
            <div className="security-modal-actions">
              <button className="nav-mobile-button security-cancel-btn" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="nav-mobile-button danger" onClick={confirmDelete}>
                Confirm delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSecurity;
