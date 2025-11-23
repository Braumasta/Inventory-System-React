// src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";

const STORE_LIST_KEY = "inventory-store-list";

const defaultStores = [
  { id: "store-main", name: "Main store", location: "Head office" },
  { id: "store-east", name: "East branch", location: "Harbor district" },
];

const loadStores = () => {
  try {
    const raw = localStorage.getItem(STORE_LIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (err) {
    // ignore and fall back to defaults
  }
  return defaultStores;
};

const AdminDashboard = () => {
  const [storeList, setStoreList] = useState(() => loadStores());
  const [selectedStoreId, setSelectedStoreId] = useState(
    () => loadStores()[0]?.id || ""
  );

  const [activeStoreFilter, setActiveStoreFilter] = useState("all");
  const [inventoryStoreFilter, setInventoryStoreFilter] = useState("all");

  // Placeholder data
  const [activeEmployees] = useState([
    { id: 1, name: "Sarah Ahmed", role: "Employee", status: "Online", storeId: "store-main" },
    { id: 2, name: "Omar Khalid", role: "Admin", status: "Online", storeId: "store-main" },
    { id: 3, name: "Leila Mansour", role: "Employee", status: "Offline", storeId: "store-east" },
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

  const [inventoryEvents] = useState([
    {
      id: "EVT-1001",
      time: "09:15",
      storeId: "store-main",
      storeName: "Main store",
      action: "Sold",
      detail: "Wireless Mouse",
      delta: -3,
      sku: "SKU-8842",
    },
    {
      id: "EVT-1002",
      time: "09:10",
      storeId: "store-east",
      storeName: "East branch",
      action: "Restocked",
      detail: "Label Printer",
      delta: 15,
      sku: "SKU-1025",
    },
    {
      id: "EVT-1003",
      time: "08:58",
      storeId: "store-main",
      storeName: "Main store",
      action: "Adjusted",
      detail: "Shipping Boxes (M)",
      delta: -12,
      sku: "SKU-9931",
    },
  ]);

  // Simple local array to show "added users" UI working
  const [pendingAccess, setPendingAccess] = useState([
    { id: "USR-48920", role: "Employee", status: "Pending", storeId: defaultStores[0].id },
  ]);
  const [newUserId, setNewUserId] = useState("");
  const [newUserRole, setNewUserRole] = useState("employee");
  const [assignStoreId, setAssignStoreId] = useState(() => loadStores()[0]?.id || "");

  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreLocation, setNewStoreLocation] = useState("");
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [storeToEdit, setStoreToEdit] = useState(null);
  const [editStoreName, setEditStoreName] = useState("");
  const [editStoreLocation, setEditStoreLocation] = useState("");
  const [storeError, setStoreError] = useState("");

  useEffect(() => {
    if (!storeList.length) {
      const fallback = loadStores();
      setStoreList(fallback);
      setSelectedStoreId(fallback[0]?.id || "");
      setAssignStoreId(fallback[0]?.id || "");
      return;
    }
    localStorage.setItem(STORE_LIST_KEY, JSON.stringify(storeList));
    const firstId = storeList[0]?.id || "";
    const hasSelected = storeList.some((s) => s.id === selectedStoreId);
    const hasAssign = storeList.some((s) => s.id === assignStoreId);
    if (!selectedStoreId && firstId) setSelectedStoreId(firstId);
    else if (selectedStoreId && !hasSelected) setSelectedStoreId(firstId);
    if (!assignStoreId && firstId) setAssignStoreId(firstId);
    else if (assignStoreId && !hasAssign) setAssignStoreId(firstId);
  }, [storeList, selectedStoreId, assignStoreId]);

  const handleAddUserAccess = (e) => {
    e.preventDefault();
    if (!newUserId.trim()) return;
    if (!assignStoreId) return;

    setPendingAccess((prev) => [
      ...prev,
      {
        id: newUserId.trim(),
        role: newUserRole === "admin" ? "Admin" : "Employee",
        status: "Pending",
        storeId: assignStoreId,
      },
    ]);
    setNewUserId("");
    setNewUserRole("employee");
    setAssignStoreId(storeList[0]?.id || "");
  };

  const handleAddStore = (e) => {
    e.preventDefault();
    const trimmedName = newStoreName.trim();
    const trimmedLocation = newStoreLocation.trim();
    if (!trimmedName) return;
    const normalizedName = trimmedName.toLowerCase();
    const normalizedLocation = (trimmedLocation || "Unspecified").toLowerCase();
    const exists = storeList.some(
      (store) =>
        store.name.toLowerCase() === normalizedName &&
        (store.location || "Unspecified").toLowerCase() === normalizedLocation
    );
    if (exists) {
      setStoreError("A store with this name at this location already exists.");
      return;
    }
    const id = `store-${Date.now()}`;
    const nextStore = {
      id,
      name: trimmedName,
      location: trimmedLocation || "Unspecified",
    };
    setStoreList((prev) => [...prev, nextStore]);
    setSelectedStoreId(id);
    setAssignStoreId(id);
    setNewStoreName("");
    setNewStoreLocation("");
  };

  const handleConfirmDeleteStore = () => {
    if (!storeToDelete) return;
    setStoreList((prev) => {
      const next = prev.filter((store) => store.id !== storeToDelete);
      const fallbackId = next[0]?.id || "";
      if (selectedStoreId === storeToDelete) setSelectedStoreId(fallbackId);
      if (assignStoreId === storeToDelete) setAssignStoreId(fallbackId);
      if (inventoryStoreFilter === storeToDelete) setInventoryStoreFilter("all");
      if (activeStoreFilter === storeToDelete) setActiveStoreFilter("all");
      return next;
    });
    setStoreToDelete(null);
  };

  const storeName = (storeId) =>
    storeList.find((store) => store.id === storeId)?.name || "Unknown store";

  const openEditStore = (storeId) => {
    const store = storeList.find((s) => s.id === storeId);
    if (!store) return;
    setStoreToEdit(storeId);
    setEditStoreName(store.name);
    setEditStoreLocation(store.location || "");
  };

  const handleSaveStoreEdit = (e) => {
    e.preventDefault();
    if (!storeToEdit) return;
    const trimmedName = editStoreName.trim();
    if (!trimmedName) return;
    setStoreList((prev) =>
      prev.map((store) =>
        store.id === storeToEdit
          ? { ...store, name: trimmedName, location: editStoreLocation.trim() }
          : store
      )
    );
    setStoreToEdit(null);
    setEditStoreName("");
    setEditStoreLocation("");
  };

  const filteredInventoryEvents = useMemo(() => {
    return inventoryEvents.filter(
      (event) => inventoryStoreFilter === "all" || event.storeId === inventoryStoreFilter
    );
  }, [inventoryEvents, inventoryStoreFilter]);

  const filteredEmployees = useMemo(() => {
    return activeEmployees.filter(
      (emp) => activeStoreFilter === "all" || emp.storeId === activeStoreFilter
    );
  }, [activeEmployees, activeStoreFilter]);

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
                <h2 className="admin-card-title">Inventory feed</h2>
                <p className="admin-card-subtitle">
                  Live snapshot across all stores. Filter by store to see what was sold,
                  added, or adjusted.
                </p>
              </div>
              <div className="admin-inline-controls">
                <label className="form-label" htmlFor="inventory-store-filter">
                  Store
                </label>
                <select
                  id="inventory-store-filter"
                  className="form-input"
                  value={inventoryStoreFilter}
                  onChange={(e) => setInventoryStoreFilter(e.target.value)}
                >
                  <option value="all">All stores</option>
                  {storeList.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="inventory-preview-wrapper">
              <table className="inventory-preview-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Store</th>
                    <th>Action</th>
                    <th>Item</th>
                    <th>Delta</th>
                    <th>SKU</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventoryEvents.map((event) => (
                    <tr key={event.id}>
                      <td data-label="Time">{event.time}</td>
                      <td data-label="Store">{event.storeName}</td>
                      <td data-label="Action">{event.action}</td>
                      <td data-label="Item">{event.detail}</td>
                      <td data-label="Delta">
                        <span
                          className={
                            "delta-pill " + (event.delta >= 0 ? "delta-up" : "delta-down")
                          }
                        >
                          {event.delta > 0 ? "+" : ""}
                          {event.delta}
                        </span>
                      </td>
                      <td data-label="SKU">{event.sku}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="inventory-feed-footer">
                <Link to="/inventory-history" className="btn-ghost">
                  Open inventory history
                </Link>
              </div>
            </div>
          </section>

          {/* User access management - NOW UNDER INVENTORY PREVIEW */}
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

              <div className="form-row">
                <label className="form-label" htmlFor="user-store">
                  Assign to store
                </label>
                <select
                  id="user-store"
                  className="form-input"
                  value={assignStoreId}
                  onChange={(e) => setAssignStoreId(e.target.value)}
                >
                  {storeList.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
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
                        <span className="pending-access-store">
                          {storeName(entry.storeId)}
                        </span>
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
              <div className="admin-inline-controls">
                <label className="form-label" htmlFor="employee-store-filter">
                  Store
                </label>
                <select
                  id="employee-store-filter"
                  className="form-input"
                  value={activeStoreFilter}
                  onChange={(e) => setActiveStoreFilter(e.target.value)}
                >
                  <option value="all">All stores</option>
                  {storeList.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <ul className="employee-list">
              {filteredEmployees.map((emp) => (
                <li key={emp.id} className="employee-item">
                  <div className="employee-main">
                    <div className="employee-name">{emp.name}</div>
                    <div className="employee-meta">
                      <span className="badge badge-role">
                        {emp.role === "Admin" ? "Admin" : "Employee"}
                      </span>
                      <span className="badge badge-muted">{storeName(emp.storeId)}</span>
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

          {/* Store locations (placed under analytics) */}
          <section className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Store locations</h2>
                <p className="admin-card-subtitle">
                  Add new stores so they appear in inventory, history filters, and user
                  access assignments.
                </p>
              </div>
            </div>
            <form className="admin-access-form" onSubmit={handleAddStore}>
              <div className="form-row">
                <label className="form-label" htmlFor="store-name">
                  Store name
                </label>
                <input
                  id="store-name"
                  className="form-input"
                  placeholder="e.g. Uptown branch"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                />
              </div>
              <div className="form-row">
                <label className="form-label" htmlFor="store-location">
                  Location / note
                </label>
                <input
                  id="store-location"
                  className="form-input"
                  placeholder="e.g. 2nd floor, Wharf district"
                  value={newStoreLocation}
                  onChange={(e) => setNewStoreLocation(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary admin-access-submit">
                Add store
              </button>
            </form>
            <div className="store-list">
              {storeList.map((store) => (
                <div key={store.id} className="store-list-item">
                  <div className="store-list-meta-stack">
                    <div className="store-list-name">{store.name}</div>
                    <div className="store-list-meta">{store.location}</div>
                  </div>
                  <div className="store-list-actions">
                    <button
                      type="button"
                      className="store-edit-btn"
                      onClick={() => openEditStore(store.id)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="store-delete-btn"
                      onClick={() => setStoreToDelete(store.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {storeToEdit && (
        <div className="admin-modal-overlay">
          <form className="admin-modal" onSubmit={handleSaveStoreEdit}>
            <h4>Edit store</h4>
            <div className="form-row">
              <label className="form-label" htmlFor="edit-store-name">
                Store name
              </label>
              <input
                id="edit-store-name"
                className="form-input"
                value={editStoreName}
                onChange={(e) => setEditStoreName(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label className="form-label" htmlFor="edit-store-location">
                Location / note
              </label>
              <input
                id="edit-store-location"
                className="form-input"
                value={editStoreLocation}
                onChange={(e) => setEditStoreLocation(e.target.value)}
              />
            </div>
            <div className="admin-modal-actions">
              <button className="btn-ghost" type="button" onClick={() => setStoreToEdit(null)}>
                Cancel
              </button>
              <button className="btn-primary" type="submit">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {storeError && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h4>Store already exists</h4>
            <p>{storeError}</p>
            <div className="admin-modal-actions">
              <button className="btn-primary" onClick={() => setStoreError("")}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {storeToDelete && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h4>Delete store</h4>
            <p>
              Are you sure you want to remove {storeName(storeToDelete)} from your
              organization? This will remove it from selectors across the dashboard.
            </p>
            <div className="admin-modal-actions">
              <button className="btn-ghost" onClick={() => setStoreToDelete(null)}>
                Cancel
              </button>
              <button className="btn-primary danger" onClick={handleConfirmDeleteStore}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
