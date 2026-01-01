import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";
import {
  fetchStores,
  createStore,
  updateStore,
  deleteStore,
  fetchUsers,
  updateUserRole,
  fetchInventoryEvents,
} from "../api";

const AdminDashboard = () => {
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [storeFilter, setStoreFilter] = useState("all");
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreLocation, setNewStoreLocation] = useState("");
  const [editStoreId, setEditStoreId] = useState(null);
  const [editStoreName, setEditStoreName] = useState("");
  const [editStoreLocation, setEditStoreLocation] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info");

  useEffect(() => {
    const load = async () => {
      try {
        const [s, u, ev] = await Promise.all([
          fetchStores(),
          fetchUsers(),
          fetchInventoryEvents(),
        ]);
        setStores(s || []);
        setUsers(u || []);
        setEvents(ev || []);
      } catch (err) {
        setStatus(err.message || "Failed to load admin data");
        setStatusType("error");
      }
    };
    load();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => (storeFilter === "all" ? true : e.storeId === Number(storeFilter)));
  }, [events, storeFilter]);

  const handleAddStore = async (e) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;
    try {
      const created = await createStore({ name: newStoreName.trim(), location: newStoreLocation.trim() });
      setStores((prev) => [created, ...prev]);
      setNewStoreName("");
      setNewStoreLocation("");
      setStatus("Store added");
      setStatusType("success");
    } catch (err) {
      setStatus(err.message || "Could not add store");
      setStatusType("error");
    }
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    if (!editStoreId || !editStoreName.trim()) return;
    try {
      const updated = await updateStore(editStoreId, {
        name: editStoreName.trim(),
        location: editStoreLocation.trim(),
      });
      setStores((prev) => prev.map((s) => (s.id === editStoreId ? updated : s)));
      setEditStoreId(null);
      setEditStoreName("");
      setEditStoreLocation("");
      setStatus("Store updated");
      setStatusType("success");
    } catch (err) {
      setStatus(err.message || "Could not update store");
      setStatusType("error");
    }
  };

  const handleDeleteStore = async (id) => {
    try {
      await deleteStore(id);
      setStores((prev) => prev.filter((s) => s.id !== id));
      setStatus("Store deleted");
      setStatusType("success");
    } catch (err) {
      setStatus(err.message || "Could not delete store");
      setStatusType("error");
    }
  };

  const handleUserRole = async (id, role) => {
    try {
      await updateUserRole(id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
      setStatus("User role updated");
      setStatusType("success");
    } catch (err) {
      setStatus(err.message || "Could not update user");
      setStatusType("error");
    }
  };

  return (
    <div className="admin-dashboard container">
      <div className="admin-dashboard-header">
        <div className="admin-header-copy">
          <h1 className="admin-dashboard-title">Admin dashboard</h1>
          <p className="admin-dashboard-subtitle">Manage stores, users, and inventory events.</p>
        </div>
        <div className="admin-dashboard-stats">
          <div className="admin-stat-pill">
            <span className="admin-stat-label">Stores</span>
            <span className="admin-stat-value">{stores.length}</span>
          </div>
          <div className="admin-stat-pill">
            <span className="admin-stat-label">Users</span>
            <span className="admin-stat-value">{users.length}</span>
          </div>
          <div className="admin-stat-pill">
            <span className="admin-stat-label">Events</span>
            <span className="admin-stat-value">{events.length}</span>
          </div>
        </div>
      </div>

      {status && <div className={`alert ${statusType}`}>{status}</div>}

      <div className="admin-grid">
        <div className="admin-grid-main">
          <section className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Inventory events</h2>
              <div className="admin-inline-controls">
                <label className="form-label" htmlFor="event-store-filter">
                  Store
                </label>
                <select
                  id="event-store-filter"
                  className="form-input"
                  value={storeFilter}
                  onChange={(e) => setStoreFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
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
                    <th>Action</th>
                    <th>SKU</th>
                    <th>Detail</th>
                    <th>Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((ev) => (
                    <tr key={ev.id}>
                      <td>{ev.createdAt ? new Date(ev.createdAt).toLocaleString() : ""}</td>
                      <td>{ev.action}</td>
                      <td>{ev.sku || ""}</td>
                      <td>{ev.detail || ""}</td>
                      <td>{ev.delta}</td>
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

          <section className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Stores</h2>
            </div>
            <form className="admin-access-form" onSubmit={handleAddStore}>
              <div className="form-row">
                <input
                  className="form-input"
                  placeholder="Store name"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                />
                <input
                  className="form-input"
                  placeholder="Location"
                  value={newStoreLocation}
                  onChange={(e) => setNewStoreLocation(e.target.value)}
                />
                <button type="submit" className="btn-primary admin-access-submit">
                  Add store
                </button>
              </div>
            </form>
            <div className="store-list">
              {stores.map((store) => (
                <div key={store.id} className="store-list-item">
                  <div className="store-list-meta-stack">
                    <div className="store-list-name">{store.name}</div>
                    <div className="store-list-meta">{store.location}</div>
                  </div>
                  <div className="store-list-actions">
                    <button
                      type="button"
                      className="store-edit-btn"
                      onClick={() => {
                        setEditStoreId(store.id);
                        setEditStoreName(store.name);
                        setEditStoreLocation(store.location || "");
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="store-delete-btn"
                      onClick={() => handleDeleteStore(store.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {editStoreId && (
              <form className="admin-access-form" onSubmit={handleSaveStore}>
                <div className="form-row">
                  <input
                    className="form-input"
                    placeholder="Store name"
                    value={editStoreName}
                    onChange={(e) => setEditStoreName(e.target.value)}
                  />
                  <input
                    className="form-input"
                    placeholder="Location"
                    value={editStoreLocation}
                    onChange={(e) => setEditStoreLocation(e.target.value)}
                  />
                  <button type="submit" className="btn-primary admin-access-submit">
                    Save
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>

        <div className="admin-grid-side">
          <section className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Users</h2>
            </div>
            <table className="inventory-preview-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>
                      {(u.firstName || "") + " " + (u.lastName || "")}
                    </td>
                    <td>{u.role}</td>
                    <td>
                      <select
                        className="form-input"
                        value={u.role}
                        onChange={(e) => handleUserRole(u.id, e.target.value)}
                      >
                        <option value="admin">Admin</option>
                        <option value="employee">Employee</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
