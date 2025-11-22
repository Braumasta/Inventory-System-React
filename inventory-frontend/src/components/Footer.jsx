import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-text">
          © {new Date().getFullYear()} InventorySphere. All rights reserved.
        </div>

        <div className="footer-links">
          <a href="#about" className="footer-link">
            About
          </a>
          <a href="#contact" className="footer-link">
            Contact
          </a>
          <a href="#privacy" className="footer-link">
            Privacy
          </a>
        </div>

        <div className="footer-social">
          {/* You can replace with real icons later */}
          <div className="social-icon">f</div>
          <div className="social-icon">X</div>
          <div className="social-icon">in</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
