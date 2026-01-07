import React from 'react';
import '../styles/HomePage.css';

const AboutPage = () => {
  return (
    <div className="container" style={{ paddingTop: '1.8rem' }}>
      <section className="hero">
        <div className="hero-grid">
          <div>
            <div className="hero-kicker">About InventorySphere</div>
            <h1 className="hero-title">A focused inventory workspace for real teams.</h1>
            <p className="hero-subtitle">
              InventorySphere is designed for organizations where teams share the
              same data and keep responsibilities clear. It's built to be clean, responsive, and
              safe to use from phones, tablets, and desktops.
            </p>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Key ideas behind the system</h3>
            <ul style={{ fontSize: '0.9rem', paddingLeft: '1.1rem', color: 'var(--text-muted)' }}>
              <li>
                <strong>Multi-tenant by design</strong> – each organization has isolated inventory
                records.
              </li>
              <li>
                <strong>Shared access</strong> - teams configure structure and update stock.
              </li>
              <li>
                <strong>Device-agnostic</strong> – works equally well on mobile, tablet, and
                desktop.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <div className="section-header">
          <h2 className="section-title">How it fits into your workflow</h2>
          <p className="section-subtitle">
            The goal is to keep structure clear while making daily operations simple for staff.
          </p>
        </div>

        <div className="hero-grid">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Operations</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Teams see dashboards, recent product additions, and configuration tools.
            </p>
            <ul style={{ fontSize: '0.9rem', paddingLeft: '1.1rem' }}>
              <li>Configure custom columns and rules per organization</li>
              <li>Manage product attributes, categories, and locations</li>
              <li>Monitor newly added items and low stock alerts</li>
            </ul>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Daily updates</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Everyone interacts with the inventory without extra clutter.
            </p>
            <ul style={{ fontSize: '0.9rem', paddingLeft: '1.1rem' }}>
              <li>Search and view product availability</li>
              <li>Update quantities as items are sold or moved</li>
              <li>Use barcode scanning flows (to be wired to backend later)</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

