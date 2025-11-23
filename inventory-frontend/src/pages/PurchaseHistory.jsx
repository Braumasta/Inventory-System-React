import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Inventory.css";

const LOG_STORAGE_KEY = "inventory-purchase-log";

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
  // default: last 7 days
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return date >= sevenDaysAgo;
};

const buildPurchaseCsv = (purchase) => {
  const headers = [
    "purchaseId",
    "timestamp",
    "sku",
    "name",
    "quantity",
    "price",
    "subtotal",
    "discountPercent",
    "discountAmount",
    "tax",
    "total",
  ];

  const rows = purchase.items.map((item) => ({
    purchaseId: purchase.id,
    timestamp: purchase.timestamp,
    sku: item.SKU,
    name: item.Name,
    quantity: item.Quantity,
    price: item.Price,
    subtotal: purchase.subtotal,
    discountPercent: purchase.discountPercent,
    discountAmount: purchase.discountAmount,
    tax: purchase.tax,
    total: purchase.total,
  }));

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((key) => {
          const value = row[key];
          if (typeof value === "string") {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? "";
        })
        .join(",")
    ),
  ].join("\n");

  return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
};

const PurchaseHistory = () => {
  const [logEntries, setLogEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("last7");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOG_STORAGE_KEY);
      if (stored) {
        setLogEntries(JSON.parse(stored));
      }
    } catch (err) {
      // ignore
    }
  }, []);

  const filtered = useMemo(() => {
    return logEntries
      .filter((entry) => filterByTime(entry.timestamp, timeFilter))
      .filter((entry) =>
        entry.id.toLowerCase().includes(search.toLowerCase().trim())
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [logEntries, search, timeFilter]);

  return (
    <div className="inventory-page">
      <header className="inventory-header">
        <p className="inventory-kicker">Purchase history</p>
        <h1 className="inventory-title">Recent purchases</h1>
        <p className="inventory-subtitle">
          Showing purchases from the last 7 days. Filter by time window or search
          for a purchase ID. Each purchase can be exported as an Excel-friendly CSV.
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
            <label className="form-label" htmlFor="search-purchase">
              Search by purchase ID
            </label>
            <input
              id="search-purchase"
              className="form-input"
              placeholder="e.g. PUR-12345678"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
            <div className="history-empty">No purchases found for this range.</div>
          )}

          {filtered.map((purchase) => (
            <div key={purchase.id} className="history-card glass-card">
              <div className="history-card-header">
                <div>
                  <div className="history-id">{purchase.id}</div>
                  <div className="history-time">
                    {new Date(purchase.timestamp).toLocaleString()}
                  </div>
                </div>
                <a
                  className="btn-ghost"
                  href={buildPurchaseCsv(purchase)}
                  download={`${purchase.id}.csv`}
                >
                  Download CSV
                </a>
              </div>

              <div className="history-table-wrapper">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Line total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchase.items.map((item, idx) => (
                      <tr key={idx}>
                        <td data-label="SKU">{item.SKU}</td>
                        <td data-label="Item">{item.Name}</td>
                        <td data-label="Qty">{item.Quantity}</td>
                        <td data-label="Price">${Number(item.Price || 0).toFixed(2)}</td>
                        <td data-label="Line total">
                          ${(Number(item.Price || 0) * item.Quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="history-summary">
                <div>
                  <div className="stat-label">Subtotal</div>
                  <div className="stat-value">${purchase.subtotal.toFixed(2)}</div>
                </div>
                <div>
                  <div className="stat-label">Discount</div>
                  <div className="stat-value">
                    -${purchase.discountAmount.toFixed(2)} ({purchase.discountPercent}%)
                  </div>
                </div>
                <div>
                  <div className="stat-label">Tax</div>
                  <div className="stat-value">${purchase.tax.toFixed(2)}</div>
                </div>
                <div>
                  <div className="stat-label">Total</div>
                  <div className="stat-value">${purchase.total.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PurchaseHistory;
