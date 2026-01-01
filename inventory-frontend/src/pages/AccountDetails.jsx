import React, { useEffect, useState } from "react";
import "../styles/AccountDetails.css";
import { updateProfile, fetchMe } from "../api";

const AccountDetails = ({ user, onUpdateUser }) => {
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [middleName, setMiddleName] = useState(user?.middleName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [dob, setDob] = useState(user?.dob || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info");

  useEffect(() => {
    setFirstName(user?.firstName || "");
    setMiddleName(user?.middleName || "");
    setLastName(user?.lastName || "");
    setDob(user?.dob || "");
    setAvatarPreview(user?.avatarUrl || "");
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const fullName = [firstName, middleName, lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    try {
      await updateProfile({ firstName, lastName, avatarUrl: avatarPreview });
      const refreshed = await fetchMe();
      onUpdateUser?.({
        ...refreshed,
        middleName,
        dob,
        name: fullName || refreshed.firstName || user.name,
        avatarUrl: avatarPreview,
      });
      setStatus("Profile updated");
      setStatusType("success");
    } catch (err) {
      setStatus(err.message || "Could not update profile");
      setStatusType("error");
    }
  };

  const roleLabel = user?.role === "admin" ? "Admin" : "Employee";
  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div className="account-page container">
      <header className="account-header">
        <div>
          <h1 className="account-title">Account details</h1>
          <p className="account-subtitle">
            Update your profile photo, personal information, and date of birth. Your
            unique ID stays visible for admin tasks.
          </p>
        </div>
      </header>

      <div className="account-grid">
        <section className="account-card account-profile">
          {status && <div className={`alert ${statusType}`}>{status}</div>}
          <div className="avatar-upload">
            <div className="avatar-frame">
              {avatarPreview ? (
                <img src={avatarPreview} alt={user?.name} className="avatar-large" />
              ) : (
                <div className="avatar-large-fallback">{initials}</div>
              )}
            </div>
            <label className="avatar-upload-btn">
              Change photo
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
            </label>
            <div className="account-id">
              Unique ID: <strong>{user?.id || "USR-00000"}</strong>
            </div>
          </div>

          <div className="account-meta">
            <div>
              <div className="account-meta-label">Email</div>
              <div className="account-meta-value">{user?.email}</div>
            </div>
            <div>
              <div className="account-meta-label">Role</div>
              <div className="account-role-pill">{roleLabel}</div>
            </div>
          </div>
        </section>

        <section className="account-card">
          <form className="account-form" onSubmit={handleSubmit}>
            <div className="account-form-row">
              <label className="account-label" htmlFor="first-name">
                First name
              </label>
              <input
                id="first-name"
                className="account-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>

            <div className="account-form-row">
              <label className="account-label" htmlFor="middle-name">
                Middle name
              </label>
              <input
                id="middle-name"
                className="account-input"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Middle name (optional)"
              />
            </div>

            <div className="account-form-row">
              <label className="account-label" htmlFor="last-name">
                Last name
              </label>
              <input
                id="last-name"
                className="account-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>

            <div className="account-form-row">
              <label className="account-label" htmlFor="dob">
                Date of birth
              </label>
              <input
                id="dob"
                type="date"
                className="account-input"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary account-save-btn">
              Save changes
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AccountDetails;
