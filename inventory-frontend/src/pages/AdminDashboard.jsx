import React from "react";
import "../styles/Dashboard.css";

const AdminDashboard = ({ user }) => {
  // Placeholder data – later will be replaced with real API data
  const activeEmployees = [
    { id: 1, name: "Sarah Ahmed", role: "Inventory Manager", status: "Online" },
    { id: 2, name: "Omar Nassar", role: "Sales Associate", status: "At store" },
    { id: 3, name: "Lina Farhat", role: "Warehouse", status: "Online" },
    { id: 4, name: "John Doe", role: "Cashier", status: "Offline" },
  ];

  const recentItems = [
    {
      id: "INV-2412",
      name: "Wireless Mouse Pro",
      category: "Accessories",
      addedOn: "3 days ago",
      addedBy: "Sarah Ahmed",
    },
    {
      id: "INV-2413",
      name: "USB-C Docking Station",
      category: "Peripherals",
      addedOn: "4 days ago",
      addedBy: "Omar Nassar",
    },
    {
      id: "INV-2414",
      name: "27\" 4K Monitor",
      category: "Displays",
      addedOn: "5 days ago",
      addedBy: "Lina Farhat",
    },
  ];

  const liveEvents = [
    {
      id: 1,
      time: "Just now",
      message: "Item #INV-2412 scanned and sold • Qty -1",
      actor: "POS - Branch 1",
    },
    {
      id: 2,
      time: "2 min ago",
      message: "Item #INV-2099 restocked • Qty +30",
      actor: "Warehouse",
    },
    {
      id: 3,
      time: "18 min ago",
      message: "Low stock alert triggered for #INV-1843",
      actor: "System",
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              Admin dashboard
            </h1>
            <p className="dashboard-subtitle">
              High-level overview of your organization&apos;s inventory, staff
              and activity.
            </p>
          </div>
          <div className="dashboard-header-meta">
            <div className="dashboard-badge">
              {user?.role === "admin" ? "Admin view" : "Employee view (temp)"}
            </div>
            <div className="dashboard-header-user">
              Signed in as <strong>{user?.name || "User"}</strong>
            </div>
          </div>
        </header>

        {/* Top analytics row */}
        <section className="dashboard-analytics">
          <div className="analytics-card">
            <div className="analytics-label">Total products</div>
            <div className="analytics-value">1,284</div>
            <div className="analytics-trend analytics-trend--up">
              +32 this week
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-label">Active employees</div>
            <div className="analytics-value">18</div>
            <div className="analytics-trend analytics-trend--neutral">
              4 locations
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-label">Low stock items</div>
            <div className="analytics-value">27</div>
            <div className="analytics-bar">
              <div className="analytics-bar-fill" style={{ width: "38%" }} />
            </div>
            <div className="analytics-trend analytics-trend--warn">
              38% of target threshold
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-label">Movements (last 7 days)</div>
            <div className="analytics-value">642</div>
            <div className="analytics-trend analytics-trend--up">
              +12% vs previous week
            </div>
          </div>
        </section>

        {/* Middle row: employees + recent items */}
        <section className="dashboard-grid">
          {/* Active employees */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">Active employees</h2>
              <span className="dashboard-card-kicker">
                Placeholder • will be backed by real data
              </span>
            </div>

            <div className="employee-list">
              {activeEmployees.map((emp) => (
                <div key={emp.id} className="employee-row">
                  <div className="employee-avatar">
                    {emp.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="employee-main">
                    <div className="employee-name">{emp.name}</div>
                    <div className="employee-role">{emp.role}</div>
                  </div>
                  <div
                    className={
                      "employee-status " +
                      (emp.status === "Online"
                        ? "employee-status--online"
                        : emp.status === "At store"
                        ? "employee-status--store"
                        : "employee-status--offline")
                    }
                  >
                    {emp.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recently added items */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">
                Newly added (last 7 days)
              </h2>
              <span className="dashboard-card-kicker">
                Inventory placeholder
              </span>
            </div>

            <div className="recent-table">
              <div className="recent-table-header">
                <span>ID</span>
                <span>Product</span>
                <span>Category</span>
                <span>Added</span>
              </div>
              <div className="recent-table-body">
                {recentItems.map((item) => (
                  <div key={item.id} className="recent-row">
                    <span className="recent-cell-id">{item.id}</span>
                    <span className="recent-cell-name">{item.name}</span>
                    <span className="recent-cell-category">
                      {item.category}
                    </span>
                    <span className="recent-cell-meta">
                      {item.addedOn}
                      <span className="recent-cell-sub">
                        by {item.addedBy}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom row: live activity + analytics notes */}
        <section className="dashboard-grid dashboard-grid--bottom">
          {/* Live activity feed */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">Live activity</h2>
              <span className="dashboard-card-kicker">
                Real-time updates when items are scanned & processed
              </span>
            </div>

            <p className="dashboard-helper-text">
              This section will be powered by barcode scan events from POS and
              warehouse devices. For now, it shows sample data.
            </p>

            <div className="live-feed">
              {liveEvents.map((event) => (
                <div key={event.id} className="live-event">
                  <div className="live-dot" />
                  <div className="live-main">
                    <div className="live-message">{event.message}</div>
                    <div className="live-meta">
                      <span>{event.time}</span> • <span>{event.actor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics insights */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">Analytics overview</h2>
              <span className="dashboard-card-kicker">
                Placeholder analytics section
              </span>
            </div>

            <p className="dashboard-helper-text">
              This space will later host dynamic charts and KPIs such as demand
              trends, stock turnover rate, and employee performance metrics.
            </p>

            <div className="analytics-insights">
              <div className="insight-row">
                <div className="insight-label">Top-moving category</div>
                <div className="insight-value">Peripherals (32% of movements)</div>
              </div>
              <div className="insight-row">
                <div className="insight-label">Average daily sales</div>
                <div className="insight-value">~92 item movements/day</div>
              </div>
              <div className="insight-row">
                <div className="insight-label">Restock compliance</div>
                <div className="insight-progress">
                  <div
                    className="insight-progress-fill"
                    style={{ width: "76%" }}
                  />
                </div>
                <div className="insight-progress-meta">76% restocked on time</div>
              </div>
              <div className="insight-row">
                <div className="insight-label">Planned enhancements</div>
                <ul className="insight-list">
                  <li>Barcode-driven quantity updates per employee role</li>
                  <li>Customizable inventory table columns (admin only)</li>
                  <li>Location-based stock heatmap</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
