import React from "react";
import { Link } from "react-router-dom";
import "../styles/HomePage.css";

const HomePage = () => {
  return (
    <div className="container">
      {/* Hero */}
      <section className="hero">
        <div className="hero-grid">
          <div>
            <div className="hero-kicker">
              Real-time inventory - Multi-device - Shared workspace
            </div>

            <h1 className="hero-title">
              Modern inventory for teams that{" "}
              <span className="hero-highlight">actually share responsibility.</span>
            </h1>

            <p className="hero-subtitle">
              InventorySphere keeps structure, stock checks, barcode scans, and
              daily updates in one clean workspace that works on any device.
            </p>

            <div className="hero-actions">
              <Link to="/contact" className="btn-primary">
                Request a demo
              </Link>
              <Link to="/about" className="btn-ghost">
                How it works
              </Link>
            </div>

            <div className="hero-meta">
              <span>
                <strong>Multi-tenant</strong> · each org has isolated data
              </span>
              <span>
                <strong>Unified access</strong> for core inventory tasks
              </span>
              <span>
                <strong>Responsive UI</strong> · phones, tablets, desktops
              </span>
            </div>
          </div>

          {/* Right hero card */}
          <div className="hero-card">
            <div className="hero-card-header">
              <div className="hero-card-title">Live inventory snapshot</div>
              <span className="hero-chip">Demo view</span>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-label">Total products</div>
                <div className="hero-stat-value">2,340</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-label">Low stock</div>
                <div className="hero-stat-value">18</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-label">Locations</div>
                <div className="hero-stat-value">5</div>
              </div>
            </div>

            <p className="hero-subtitle" style={{ marginBottom: 0 }}>
              Designed for barcode workflows, stock audits, and quick lookups —
              without extra setup or heavy training.
            </p>
          </div>
        </div>
      </section>

      {/* About-style section preview */}
      <section style={{ marginTop: "2.5rem" }}>
        <div className="section-header">
          <h2 className="section-title">
            Built for organizations, not just single users
          </h2>
          <p className="section-subtitle">
            Keep inventory structured and easy to update for everyone on the team.
          </p>
        </div>

        <div className="hero-grid">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Operations setup</h3>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.9rem",
              }}
            >
              Configure columns, categories, and locations. Keep the catalog
              organized and ready for day-to-day updates.
            </p>
            <ul
              style={{
                fontSize: "0.9rem",
                paddingLeft: "1.1rem",
              }}
            >
              <li>CRUD operations over products and structure</li>
              <li>Keep structure consistent across stores and locations</li>
              <li>Track newly added products in the last 7 days</li>
            </ul>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Daily flow</h3>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.9rem",
              }}
            >
              Clean views focused on what is in stock and what changed. Optimized
              for barcode scanning from a phone or tablet.
            </p>
            <ul
              style={{
                fontSize: "0.9rem",
                paddingLeft: "1.1rem",
              }}
            >
              <li>Search products quickly by name or barcode</li>
              <li>Update quantities as items are sold or moved</li>
              <li>Mobile-first design for staff on the floor</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="section-header">
          <h2 className="section-title">What teams say</h2>
          <p className="section-subtitle">
            Example testimonials to show how teams benefit from the system.
          </p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p className="testimonial-quote">
              "We love how we can change the inventory columns without touching
              code, and the updates appear instantly for everyone."
            </p>
            <div className="testimonial-meta">
              <strong>Leila • Operations Manager</strong>
              <br />
              Retail chain · 4 locations
            </div>
          </div>

          <div className="testimonial-card">
            <p className="testimonial-quote">
              “I just scan, check the quantity, and confirm the sale. I don&apos;t
              see any settings I can accidentally break.”
            </p>
            <div className="testimonial-meta">
              <strong>Karim • Sales Associate</strong>
              <br />
              Electronics store
            </div>
          </div>

          <div className="testimonial-card">
            <p className="testimonial-quote">
              “The UI works the same on my laptop and my phone. Perfect for quick
              stock checks on the move.”
            </p>
            <div className="testimonial-meta">
              <strong>Nour • Inventory Supervisor</strong>
              <br />
              Wholesale distributor
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;






