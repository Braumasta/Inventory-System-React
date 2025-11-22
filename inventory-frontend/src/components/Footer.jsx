import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer" id="contact">
      <div className="footer-inner">
        <div>
          <div style={{ fontWeight: 500 }}>InventorySphere</div>
          <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            © {currentYear} All rights reserved.
          </div>
        </div>

        <div className="footer-links">
          <span style={{ color: 'var(--text-muted)' }}>Status</span>
          <span style={{ color: 'var(--text-muted)' }}>Privacy</span>
          <span style={{ color: 'var(--text-muted)' }}>Terms</span>
        </div>

        <div className="footer-social">
          {/* Later you can add actual links + FontAwesome/React Icons */}
          <div className="social-icon" title="Facebook">
            f
          </div>
          <div className="social-icon" title="X / Twitter">
            x
          </div>
          <div className="social-icon" title="LinkedIn">
            in
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
