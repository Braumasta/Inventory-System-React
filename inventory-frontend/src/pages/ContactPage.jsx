import React from 'react';
import '../styles/HomePage.css';

const ContactPage = () => {
  return (
    <div className="container" style={{ paddingTop: '1.8rem' }}>
      <section className="hero">
        <div className="hero-grid">
          <div>
            <div className="hero-kicker">Contact</div>
            <h1 className="hero-title">Let&apos;s talk about your inventory setup.</h1>
            <p className="hero-subtitle">
              Whether you&apos;re testing the prototype or planning a real deployment, you can reach
              out any time to discuss features, integration, and future improvements.
            </p>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Contact details</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              For now, the main contact channel is email. Later, this page can be extended with a
              fully functional form connected to the Node backend.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              <strong>Email:</strong>{' '}
              <a href="mailto:inv.org@gmail.com" style={{ color: 'var(--primary)' }}>
                inv.org@gmail.com
              </a>
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.8rem' }}>
              You can use this address for feedback, bug reports, or feature requests related to
              the system.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
