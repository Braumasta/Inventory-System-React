import React, { useState } from "react";
import "../styles/AccountSecurity.css";
import { changePassword } from "../api";

const AccountSecurity = () => {
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const setStatusMessage = (message, type = "info") => {
    setStatus(message);
    setStatusType(type);
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setStatusMessage("Password must be at least 8 characters.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMessage("Passwords do not match.", "error");
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      setStatusMessage("Password updated successfully.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setStatusMessage(err.message || "Could not update password.", "error");
    }
  };

  return (
    <div className="account-page container">
      <header className="account-header">
        <div>
          <h1 className="account-title">Account security</h1>
          <p className="account-subtitle">
            Change your password. (2FA and session locks are not enabled in this demo.)
          </p>
        </div>
      </header>

      <div className="security-grid">
        <section className="security-card">
          <div className="security-card-header">
            <div>
              <h2 className="security-card-title">Change password</h2>
              <p className="security-card-subtitle">
                Update your password for this account.
              </p>
            </div>
          </div>

          <form className="security-form" onSubmit={handlePasswordSave}>
            <div className="form-row">
              <label className="account-label" htmlFor="current-password">
                Current password
              </label>
              <input
                id="current-password"
                type="password"
                className="account-input"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
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
        </section>

        <section className="security-card danger-card">
          <div className="security-card-header">
            <div>
              <h2 className="security-card-title">Delete my account</h2>
              <p className="security-card-subtitle">
                Account deletion is not enabled in this demo.
              </p>
            </div>
          </div>
          <div className="account-meta-row">
            <span>Deletion</span>
            <span className="account-meta-value">Disabled in demo</span>
          </div>
        </section>

        {status && (
          <div className={`security-status security-status-${statusType}`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSecurity;
