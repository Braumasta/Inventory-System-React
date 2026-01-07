import React, { useState } from "react";
import "../styles/AccountSecurity.css";
import { changePassword, clearToken, deleteAccount } from "../api";

const AccountSecurity = () => {
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const setStatusMessage = (message, type = "info") => {
    setStatus(message);
    setStatusType(type);
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setStatusMessage("Enter your current password.", "error");
      return;
    }
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

  const handleDeleteAccount = async () => {
    if (deleteConfirm.trim().toUpperCase() !== "DELETE") {
      setStatusMessage("Type DELETE to confirm account removal.", "error");
      return;
    }
    try {
      await deleteAccount();
      clearToken();
      setStatusMessage("Account deleted. You can now sign up again.", "success");
      setDeleteConfirm("");
      window.location.href = "/auth";
    } catch (err) {
      setStatusMessage(err.message || "Could not delete account.", "error");
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
                This permanently removes your profile, stores, items, and orders.
              </p>
            </div>
          </div>
          <div className="security-delete">
            <label className="account-label" htmlFor="delete-confirm">
              Type DELETE to confirm
            </label>
            <input
              id="delete-confirm"
              className="account-input"
              placeholder="DELETE"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
            <button
              type="button"
              className="btn-primary danger"
              onClick={handleDeleteAccount}
            >
              Delete account
            </button>
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
