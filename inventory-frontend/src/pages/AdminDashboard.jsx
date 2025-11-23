// src/pages/AdminDashboard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";

const AdminDashboard = () => {
  // Placeholder data
  const [activeEmployees] = useState([
    { id: 1, name: "Sarah Ahmed", role: "Employee", status: "Online" },
    { id: 2, name: "Omar Khalid", role: "Admin", status: "Online" },
    { id: 3, name: "Leila Mansour", role: "Employee", status: "Offline" },
  ]);

  const [recentItems] = useState([
    { id: "INV-1023", name: "Wireless Mouse", added: "2 days ago" },
    { id: "INV-1024", name: "USB-C Hub", added: "3 days ago" },
    { id: "INV-1025", name: "Label Printer", added: "6 days ago" },
  ]);

  const [liveEvents] = useState([
    { time: "09:12", user: "Sarah", action: "Scanned item", code: "SKU-8842" },
    { time: "09:07", user: "Omar", action: "Adjusted quantity", code: "SKU-7719" },
    { time: "08:55", user: "Leila", action: "Processed order", code: "ORD-2034" },
  ]);

  // Simple local array to show "added users" UI working
  const [pendingAccess, setPendingAccess] = useState([
    { id: "USR-48920", role: "Employee", status: "Pending" },
  ]);
  const [newUserId, setNewUserId] = useState("");
  const [newUserRole, setNewUserRole] = useState("employee");

  const handleAddUserAccess = (e) => {
    e.preventDefault();
    if (!newUserId.trim()) return;

    setPendingAccess((prev) => [
      ...prev,
      {
        id: newUserId.trim(),
        role: newUserRole === "admin" ? "Admin" : "Employee",
        status: "Pending",
      },
    ]);
    setNewUserId("");
    setNewUserRole("employee");
  };

  return (
    <div className="admin-dashboard container">
      {/* Header */}
      <div className="admin-dashboard-header">
        <div className="admin-header-copy">
          <h1 className="admin-dashboard-title">Admin dashboard</h1>
          <p className="admin-dashboard-subtitle">
            Monitor your organization&apos;s inventory, user access, and live activity
            in one place.
          </p>
        </div>
        <div className="admin-dashboard-stats">
          <div className="admin-stat-pill">
            <span className="admin-stat-label">Active employees</span>
            <span className="admin-stat-value">{activeEmployees.length}</span>
          </div>
          <div className="admin-stat-pill">
            <span className="admin-stat-label">New items (7 days)</span>
            <span className="admin-stat-value">{recentItems.length}</span>
          </div>
          <div className="admin-stat-pill">
            <span className="admin-stat-label">Live feed</span>
            <span className="admin-stat-value">{liveEvents.length}</span>
          </div>
        </div>
      </div>

      {/* Main layout grid */}
      <div className="admin-grid">
        {/* LEFT COLUMN: live feed + inventory preview + user access */}
        <div className="admin-grid-main">
          {/* Live scan feed */}
          <section className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Live scan feed</h2>
                <p className="admin-card-subtitle">
                  Placeholder stream showing recent barcode scans and quantity updates.
                </p>
              </div>
              <span className="live-pill">Live</span>
            </div>

            <ul className="live-feed-list">
              {liveEvents.map((event, idx) => (
                <li key={idx} className="live-feed-item">
                  <div className="live-feed-time">{event.time}</div>
                  <div className="live-feed-main">
                    <div className="live-feed-text">
                      <strong>{event.user}</strong> &mdash; {event.action}
                    </div>
                    <div className="live-feed-code">{event.code}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Inventory preview card */}
          <section className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Inventory preview</h2>
                <p className="admin-card-subtitle">
                  Quick glimpse of key stock items. Use the button to open the full
                  inventory workspace.
                </p>
              </div>
              <Link to="/inventory" className="btn-primary admin-card-cta">
                Open inventory
              </Link>
            </div>

            <div className="inventory-preview-wrapper">
              <table className="inventory-preview-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Item</th>
                    <th>Location</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td data-label="SKU">SKU-8842</td>
                    <td data-label="Item">Wireless Mouse</td>
                    <td data-label="Location">Main storage</td>
                    <td data-label="Quantity">42</td>
                    <td data-label="Status">
                      <span className="badge badge-ok">In stock</span>
                    </td>
                  </tr>
                  <tr>
                    <td data-label="SKU">SKU-7719</td>
                    <td data-label="Item">Barcode Scanner</td>
                    <td data-label="Location">Front desk</td>
                    <td data-label="Quantity">8</td>
                    <td data-label="Status">
                      <span className="badge badge-low">Low</span>
                    </td>
                  </tr>
                  <tr>
                    <td data-label="SKU">SKU-9931</td>
                    <td data-label="Item">Shipping Boxes (M)</td>
                    <td data-label="Location">Warehouse B</td>
                    <td data-label="Quantity">120</td>
                    <td data-label="Status">
                      <span className="badge badge-ok">In stock</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* User access management – NOW UNDER INVENTORY PREVIEW */}
          <section className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">User access management</h2>
              <p className="admin-card-subtitle">
                Add users (registered on this site) to your organization by their
                unique ID and assign a role. This is a front-end placeholder; the
                unique ID field will be populated from account details later.
              </p>
            </div>

            <form className="admin-access-form" onSubmit={handleAddUserAccess}>
              <div className="form-row">
                <label className="form-label" htmlFor="user-id">
                  User unique ID
                </label>
                <input
                  id="user-id"
                  type="text"
                  className="form-input"
                  placeholder="e.g. USR-90321"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                />
              </div>

              <div className="form-row">
                <label className="form-label" htmlFor="user-role">
                  Role in this organization
                </label>
                <select
                  id="user-role"
                  className="form-input"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button type="submit" className="btn-primary admin-access-submit">
                Add to organization
              </button>
            </form>

            {pendingAccess.length > 0 && (
              <div className="pending-access-list">
                <div className="pending-access-title">Pending access</div>
                <ul>
                  {pendingAccess.map((entry, idx) => (
                    <li key={idx} className="pending-access-item">
                      <div className="pending-access-main">
                        <div className="pending-access-id">{entry.id}</div>
                        <div className="pending-access-role">
                          {entry.role === "Admin" ? "Admin" : "Employee"}
                        </div>
                      </div>
                      <div className="pending-access-status">
                        {entry.status}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: employees + recent + analytics */}
        <div className="admin-grid-side">
          {/* Active employees */}
          <section className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Active employees</h2>
              <p className="admin-card-subtitle">
                People who currently have access to this organization&apos;s workspace.
              </p>
            </div>
            <ul className="employee-list">
              {activeEmployees.map((emp) => (
                <li key={emp.id} className="employee-item">
                  <div className="employee-main">
                    <div className="employee-name">{emp.name}</div>
                    <div className="employee-meta">
                      <span className="badge badge-role">
                        {emp.role === "Admin" ? "Admin" : "Employee"}
                      </span>
                    </div>
                  </div>
                  <div
                    className={
                      "employee-status " +
                      (emp.status === "Online" ? "employee-status-online" : "")
                    }
                  >
                    {emp.status}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Recently added items */}
          <section className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Added in last 7 days</h2>
              <p className="admin-card-subtitle">
                Placeholder data for newly registered inventory items.
              </p>
            </div>
            <ul className="recent-items">
              {recentItems.map((item) => (
                <li key={item.id} className="recent-item">
                  <div className="recent-item-main">
                    <div className="recent-item-name">{item.name}</div>
                    <div className="recent-item-id">{item.id}</div>
                  </div>
                  <div className="recent-item-time">{item.added}</div>
                </li>
              ))}
            </ul>
          </section>

          {/* Analytics overview */}
          <section className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Analytics overview</h2>
              <p className="admin-card-subtitle">
                Simple placeholder metrics for inventory performance.
              </p>
            </div>

            <div className="analytics-grid">
              <div className="analytics-stat">
                <div className="analytics-label">Total SKUs</div>
                <div className="analytics-value">1,284</div>
                <div className="analytics-trend analytics-trend-up">
                  +4.2% vs last month
                </div>
              </div>
              <div className="analytics-stat">
                <div className="analytics-label">Low stock items</div>
                <div className="analytics-value">27</div>
                <div className="analytics-trend analytics-trend-warn">
                  Review reorder levels
                </div>
              </div>
              <div className="analytics-stat">
                <div className="analytics-label">Processed today</div>
                <div className="analytics-value">112</div>
                <div className="analytics-trend analytics-trend-up">
                  +19 orders vs yesterday
                </div>
              </div>
            </div>

            <div className="analytics-bar-placeholder">
              <div className="analytics-bar analytics-bar-1" />
              <div className="analytics-bar analytics-bar-2" />
              <div className="analytics-bar analytics-bar-3" />
              <div className="analytics-bar analytics-bar-4" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
