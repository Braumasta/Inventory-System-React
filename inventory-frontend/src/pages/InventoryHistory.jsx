import React from "react";
import { Link } from "react-router-dom";
import "../styles/Inventory.css";

const InventoryHistory = () => {
  return (
    <div className="inventory-page">
      <header className="inventory-header">
        <p className="inventory-kicker">Inventory history</p>
        <h1 className="inventory-title">Recent edits</h1>
        <p className="inventory-subtitle">
          Inventory events are no longer tracked. Use purchase history for sales activity.
        </p>
        <div className="inventory-header-actions">
          <Link to="/inventory" className="btn-ghost inventory-history-link">
            Back to inventory
          </Link>
        </div>
      </header>

      <section className="inventory-shell card">
        <div className="empty-state">
          <p>No inventory events to display.</p>
          <Link to="/purchase-history" className="btn-primary">
            View purchase history
          </Link>
        </div>
      </section>
    </div>
  );
};

export default InventoryHistory;
