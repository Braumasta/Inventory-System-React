import React from 'react';

const LandingPage = () => {
  return (
    <div className="container">
      {/* Hero */}
      <section className="hero">
        <div className="hero-grid">
          <div>
            <div className="hero-kicker">
              <span>🧾 Inventory, but smarter</span>
            </div>
            <h1 className="hero-title">
              Centralize your stock with a{' '}
              <span className="hero-highlight">multi-user inventory system</span>.
            </h1>
            <p className="hero-subtitle">
              Give each organization a secure, isolated workspace. Admins define the
              structure, employees simply scan barcodes and update quantities in real time.
            </p>

            <div className="hero-actions">
              <button className="btn-primary">
                Get started
              </button>
              <button className="btn-ghost">
                View admin dashboard
              </button>
            </div>

            <div className="hero-meta">
              <span>
                <strong>Role hierarchy:</strong> Admins & employees with fine-grained access.
              </span>
              <span>
                <strong>Barcode-ready:</strong> Built to work with scanners at the counter.
              </span>
            </div>
          </div>

          <div>
            <div className="hero-card">
              <div className="hero-card-header">
                <div className="hero-card-title">Today at a glance</div>
                <div className="hero-chip">Demo snapshot</div>
              </div>

              <div className="hero-stats">
                <div className="hero-stat">
                  <div className="hero-stat-label">Total SKUs</div>
                  <div className="hero-stat-value">2,340</div>
                  <div className="hero-stat-label">multi-org isolated</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-label">Low stock alerts</div>
                  <div className="hero-stat-value">18</div>
                  <div className="hero-stat-label">auto-flagged</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-label">Sales today</div>
                  <div className="hero-stat-value">427</div>
                  <div className="hero-stat-label">via barcode scan</div>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Designed to feel great on phones, tablets and desktops with a responsive,
                clean interface and seamless dark mode.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" style={{ marginTop: '2.5rem' }}>
        <div className="section-header">
          <div>
            <div className="section-title">Built for teams, not spreadsheets</div>
            <div className="section-subtitle">
              Separate workspaces for each account, unique user IDs, and clear
              admin/employee roles.
            </div>
          </div>
        </div>

        <div className="testimonials-grid">
          <div className="card">
            <div className="stats-label">Multi-tenant architecture</div>
            <p className="testimonial-quote">
              Each user account (or organization) gets its own inventory space. Admins
              manage structure and access rules; basic users only change quantities and
              log sales.
            </p>
          </div>

          <div className="card">
            <div className="stats-label">Barcode-first workflow</div>
            <p className="testimonial-quote">
              Employees scan a product, instantly see availability, and decrement
              quantities when a sale is confirmed. No more manual lookups or Excel sheets.
            </p>
          </div>

          <div className="card">
            <div className="stats-label">Fully responsive</div>
            <p className="testimonial-quote">
              Works confidently on checkout tablets, warehouse desktops, and managers’
              phones. Light and dark themes adapt to the environment.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="section-header">
          <div>
            <div className="section-title">What teams say</div>
            <div className="section-subtitle">
              Example testimonials you can later replace with real clients.
            </div>
          </div>
        </div>

        <div className="testimonials-grid">
          <article className="testimonial-card">
            <p className="testimonial-quote">
              “As an admin, I can add any custom columns I want: brand, supplier, expiry
              date, even internal codes – and everything stays in sync.”
            </p>
            <div className="testimonial-meta">
              <strong>Layla — Inventory Admin</strong>
              <br />
              Horizon Retail Group
            </div>
          </article>

          <article className="testimonial-card">
            <p className="testimonial-quote">
              “At the counter, I just scan, check stock, and confirm the sale. The
              quantity is updated without me thinking about it.”
            </p>
            <div className="testimonial-meta">
              <strong>Omar — Sales Associate</strong>
              <br />
              City Electronics
            </div>
          </article>

          <article className="testimonial-card">
            <p className="testimonial-quote">
              “The dashboard gives us a quick overview of what’s selling and what’s
              running out. Dark mode is a nice bonus during late shifts.”
            </p>
            <div className="testimonial-meta">
              <strong>Sara — Store Manager</strong>
              <br />
              Nova Pharmacy
            </div>
          </article>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
