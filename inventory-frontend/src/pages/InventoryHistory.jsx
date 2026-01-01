import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Inventory.css";
import { fetchInventoryEvents } from "../api";

const InventoryHistory = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchInventoryEvents();
        setEvents(data || []);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return events.filter((entry) => {
      if (storeFilter === "all") return true;
      return entry.storeId === Number(storeFilter);
    });
  }, [events, storeFilter]);

  return (
    <div className="inventory-page">
      <header className="inventory-header">
        <p className="inventory-kicker">Inventory history</p>
        <h1 className="inventory-title">Recent edits</h1>
        <p className="inventory-subtitle">Live events from the backend.</p>
        <div className="inventory-header-actions">
          <Link to="/inventory" className="btn-ghost inventory-history-link">
            Back to inventory
          </Link>
        </div>
      </header>

      <section className="inventory-shell card">
        {error && <div className="alert error">{error}</div>}
        {loading && <div className="alert info">Loading history...</div>}

        <div className="history-toolbar">
          <div className="history-search">
            <label className="form-label" htmlFor="store-filter">
              Store
            </label>
            <input
              id="store-filter"
              className="form-input"
              placeholder="Enter store id or leave empty"
              value={storeFilter === "all" ? "" : storeFilter}
              onChange={(e) => setStoreFilter(e.target.value ? e.target.value : "all")}
            />
          </div>
        </div>

        <div className="history-list">
          {filtered.length === 0 && !loading && (
            <div className="history-empty">No edits found.</div>
          )}

          {filtered.map((entry) => (
            <div key={entry.id} className="history-card glass-card">
              <div className="history-card-header">
                <div>
                  <div className="history-id">{entry.id}</div>
                  <div className="history-time">
                    {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ""}
                  </div>
                </div>
                <div className="history-action-badge">{entry.action}</div>
              </div>
              <div className="history-summary">
                <div>
                  <div className="stat-label">SKU</div>
                  <div className="stat-value">{entry.sku || ""}</div>
                </div>
                <div>
                  <div className="stat-label">Detail</div>
                  <div className="stat-value">{entry.detail}</div>
                </div>
                <div>
                  <div className="stat-label">Delta</div>
                  <div className="stat-value">{entry.delta}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default InventoryHistory;
