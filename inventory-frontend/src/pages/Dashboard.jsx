import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";
import {
  fetchStores,
  createStore,
  updateStore,
  deleteStore,
  fetchDashboard,
} from "../api";

const Dashboard = () => {
  const [stores, setStores] = useState([]);
  const [summary, setSummary] = useState({
    totalItems: 0,
    totalSalesLast24h: 0,
    recentSales: [],
  });
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
        const [s, dashboard] = await Promise.all([fetchStores(), fetchDashboard()]);
        setStores(s || []);
        setSummary({
          totalItems: Number(dashboard?.totalItems || 0),
          totalSalesLast24h: Number(dashboard?.totalSalesLast24h || 0),
          recentSales: dashboard?.recentSales || [],
        });
      } catch (err) {
        setStatus(err.message || "Failed to load dashboard data");
        setStatusType("error");
      }
    };
    load();
  }, []);

  const recentSales = useMemo(() => summary.recentSales || [], [summary]);

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

  return (
    <div className="admin-dashboard container">
      <div className="admin-dashboard-header">
        <div className="admin-header-copy">
          <h1 className="admin-dashboard-title">Dashboard</h1>
          <p className="admin-dashboard-subtitle">
            A quick pulse on inventory, sales activity, and store operations.
          </p>
        </div>
        <div className="admin-dashboard-stats">
          <div className="admin-stat-pill">
            <span className="admin-stat-label">Stores</span>
            <span className="admin-stat-value">{stores.length}</span>
          </div>
          <div className="admin-stat-pill">
            <span className="admin-stat-label">Total items</span>
            <span className="admin-stat-value">{summary.totalItems}</span>
          </div>
          <div className="admin-stat-pill">
            <span className="admin-stat-label">Sales (24h)</span>
            <span className="admin-stat-value">
              ${Number(summary.totalSalesLast24h || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {status && <div className={`alert ${statusType}`}>{status}</div>}

      <div className="admin-grid">
        <div className="admin-grid-main">
          <section className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Recent sales</h2>
            </div>
            <div className="inventory-preview-wrapper">
              <table className="inventory-preview-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Order</th>
                    <th>Items</th>
                    <th>Customer</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.orderId}>
                      <td>{sale.createdAt ? new Date(sale.createdAt).toLocaleString() : ""}</td>
                      <td>#{sale.orderId}</td>
                      <td>{sale.itemsCount}</td>
                      <td>{sale.userEmail || "Guest"}</td>
                      <td>${Number(sale.total || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  {recentSales.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center" }}>
                        No sales yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="inventory-feed-footer">
                <Link to="/purchase-history" className="btn-ghost">
                  View purchase history
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
      </div>
    </div>
  );
};

export default Dashboard;
