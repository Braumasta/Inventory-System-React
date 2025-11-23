import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Inventory.css";

const INVENTORY_HISTORY_KEY = "inventory-history-log";
const STORE_LIST_KEY = "inventory-store-list";
const timeFilters = [
  { value: "lastHour", label: "Last hour" },
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 days" },
];

const filterByTime = (timestamp, filter) => {
  const date = new Date(timestamp);
  const now = new Date();
  if (filter === "lastHour") {
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    return date >= oneHourAgo;
  }
  if (filter === "today") {
    return date.toDateString() === now.toDateString();
  }
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return date >= sevenDaysAgo;
};

export default function InventoryHistory() {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("last7");
  const [storeList, setStoreList] = useState([]);
  const [storeFilter, setStoreFilter] = useState("all");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(INVENTORY_HISTORY_KEY);
      if (stored) {
        setEntries(JSON.parse(stored));
      }
    } catch (err) {
      // ignore
    }
    try {
      const rawStores = localStorage.getItem(STORE_LIST_KEY);
      if (rawStores) {
        const parsed = JSON.parse(rawStores);
        if (Array.isArray(parsed)) setStoreList(parsed);
      }
    } catch (err) {
      // ignore
    }
  }, []);

  const filtered = useMemo(() => {
    return entries
      .filter((entry) => filterByTime(entry.timestamp, timeFilter))
      .filter((entry) => {
        const target = `${entry.id} ${entry.action} ${(entry.sku || "")} ${(entry.column || "")}`
          .toLowerCase();
        return target.includes(search.toLowerCase());
      })
      .filter((entry) => {
        if (storeFilter === "all") return true;
        if (storeFilter === "unassigned") return !entry.storeId;
        return entry.storeId === storeFilter;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [entries, search, timeFilter, storeFilter]);

  return (
    <div className="inventory-page">
      <header className="inventory-header">
        <p className="inventory-kicker">Inventory history</p>
        <h1 className="inventory-title">Recent edits</h1>
        <p className="inventory-subtitle">
          See structure and product edits from the last 7 days. Filter by time window or
          search by ID/action.
        </p>
        <div className="inventory-header-actions">
          <Link to="/inventory" className="btn-ghost inventory-history-link">
            Back to inventory
          </Link>
        </div>
      </header>

      <section className="inventory-shell card">
        <div className="history-toolbar">
          <div className="history-search">
            <label className="form-label" htmlFor="search-history">
              Search by action / ID
            </label>
            <input
              id="search-history"
              className="form-input"
              placeholder="e.g. Add column, INV-1234"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="history-search">
            <label className="form-label" htmlFor="store-filter">
              Store
            </label>
            <select
              id="store-filter"
              className="form-input"
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
            >
              <option value="all">All stores</option>
              <option value="unassigned">Unassigned</option>
              {storeList.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
          <div className="history-filters">
            {timeFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`chip ${timeFilter === filter.value ? "chip-active" : ""}`}
                onClick={() => setTimeFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="history-list">
          {filtered.length === 0 && (
            <div className="history-empty">No edits found for this range.</div>
          )}

          {filtered.map((entry) => (
            <div key={entry.id} className="history-card glass-card">
              <div className="history-card-header">
                <div>
                  <div className="history-id">{entry.id}</div>
                  <div className="history-time">
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="history-action-badge">{entry.action}</div>
              </div>
              <div className="history-summary">
                {entry.column && (
                  <div>
                    <div className="stat-label">Column</div>
                    <div className="stat-value">{entry.column}</div>
                  </div>
                )}
                {entry.sku && (
                  <div>
                    <div className="stat-label">SKU</div>
                    <div className="stat-value">{entry.sku}</div>
                  </div>
                )}
                {entry.note && (
                  <div>
                    <div className="stat-label">Context</div>
                    <div className="stat-value">{entry.note}</div>
                  </div>
                )}
                {entry.count && (
                  <div>
                    <div className="stat-label">Rows tracked</div>
                    <div className="stat-value">{entry.count}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
