import React from "react";
import "../styles/Dashboard.css"; // keep if you already have it, or create later

const AdminDashboard = ({ user }) => {
  const displayName = user?.name || "Admin";

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Admin dashboard</h1>
        <p className="dashboard-subtitle">
          Welcome back, <strong>{displayName}</strong>. Manage your organization,
          roles, and inventory structure from here.
        </p>
      </header>

      <div className="dashboard-grid">
        <section className="card dashboard-card">
          <h2 className="dashboard-card-title">Overview</h2>
          <p className="dashboard-card-text">
            This area is reserved for high-level insights: total SKUs,
            low-stock alerts, recent employee activity, and more.
          </p>
        </section>

        <section className="card dashboard-card">
          <h2 className="dashboard-card-title">Inventory management</h2>
          <p className="dashboard-card-text">
            Admin users have full access to the inventory table on the separate
            Inventory page. From there, you can edit all columns, add new
            columns, and configure how employees interact with stock.
          </p>
          <a href="/inventory" className="btn-primary" style={{ marginTop: "0.75rem" }}>
            Go to inventory
          </a>
        </section>

        <section className="card dashboard-card">
          <h2 className="dashboard-card-title">Team & roles</h2>
          <p className="dashboard-card-text">
            Later, this section will let you invite employees, define their
            permissions, and review access logs for sensitive operations.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
