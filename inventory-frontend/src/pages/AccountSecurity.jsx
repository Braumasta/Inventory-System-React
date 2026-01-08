import React, { useEffect, useState } from "react";
import "../styles/AccountSecurity.css";
import { changePassword, clearToken, deleteAccount, verifyPassword } from "../api";

const AccountSecurity = () => {
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const setStatusMessage = (message, type = "info") => {
    setStatus(message);
    setStatusType(type);
  };

  useEffect(() => {
    setPasswordVerified(false);
  }, [currentPassword]);

  const handleVerifyPassword = async () => {
    if (!currentPassword) {
      setStatusMessage("Enter your current password.", "error");
      return;
    }
    setVerifying(true);
    try {
      await verifyPassword(currentPassword);
      setPasswordVerified(true);
      setStatusMessage("Password verified. You can set a new password.", "success");
    } catch (err) {
      setPasswordVerified(false);
      setStatusMessage(err.message || "Could not verify password.", "error");
    } finally {
      setVerifying(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setStatusMessage("Enter your current password.", "error");
      return;
    }
    if (!passwordVerified) {
      setStatusMessage("Verify your current password first.", "error");
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
      setPasswordVerified(false);
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
              <div className="security-password-row">
                <input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  className="account-input"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="security-password-toggle"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                >
                  {showCurrentPassword ? "Hide" : "View"}
                </button>
                <button
                  type="button"
                  className="btn-primary verify-btn"
                  onClick={handleVerifyPassword}
                  disabled={verifying}
                >
                  {verifying ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>
            <div className="form-row">
              <label className="account-label" htmlFor="new-password">
                New password
              </label>
              <div className="security-password-row">
                <input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  className="account-input"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={!passwordVerified}
                />
                <button
                  type="button"
                  className="security-password-toggle"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  disabled={!passwordVerified}
                >
                  {showNewPassword ? "Hide" : "View"}
                </button>
              </div>
            </div>
            <div className="form-row">
              <label className="account-label" htmlFor="confirm-password">
                Confirm password
              </label>
              <div className="security-password-row">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  className="account-input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!passwordVerified}
                />
                <button
                  type="button"
                  className="security-password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  disabled={!passwordVerified}
                >
                  {showConfirmPassword ? "Hide" : "View"}
                </button>
              </div>
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
