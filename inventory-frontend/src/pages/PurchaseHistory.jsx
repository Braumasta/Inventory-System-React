import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Inventory.css";
import { fetchOrders } from "../api";

const PurchaseHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchOrders();
        setOrders(data || []);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="inventory-page">
      <header className="inventory-header">
        <div>
          <p className="inventory-kicker">History</p>
          <h1 className="inventory-title">Purchase history</h1>
          <p className="inventory-subtitle">
            Orders created through the inventory cart.
          </p>
        </div>
        <div className="inventory-header-actions">
          <Link to="/inventory" className="btn-primary">
            Back to inventory
          </Link>
        </div>
      </header>

      <section className="inventory-shell card">
        {error && <div className="alert error">{error}</div>}
        {loading && <div className="alert info">Loading orders...</div>}

        {orders.length === 0 && !loading && (
          <div className="empty-state">
            <p>No orders yet. Complete a purchase from the inventory page.</p>
          </div>
        )}

        <div className="purchase-history">
          {orders.map((order) => (
            <div key={order.id} className="purchase-card glass-card">
              <header className="purchase-card-header">
                <div>
                  <div className="purchase-id">Order #{order.id}</div>
                  <div className="purchase-meta">
                    <span>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : ""}
                    </span>
                    {order.userEmail && <span> • {order.userEmail}</span>}
                  </div>
                </div>
                <div className="purchase-meta">
                  <strong>${Number(order.total || 0).toFixed(2)}</strong>
                </div>
              </header>

              <div className="purchase-items">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="purchase-item">
                    <div>
                      <div className="purchase-item-name">
                        {item.name || item.sku || "Item"}
                      </div>
                      <div className="purchase-item-sku">{item.sku}</div>
                    </div>
                    <div className="purchase-item-meta">
                      <span>Qty: {item.quantity}</span>
                      <span>${Number(item.priceEach || 0).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PurchaseHistory;
