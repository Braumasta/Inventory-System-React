import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-text">
          © {new Date().getFullYear()} InventorySphere. All rights reserved.
        </div>

        <div className="footer-links">
          <Link to="/about" className="footer-link">
            About
          </Link>
          <Link to="/contact" className="footer-link">
            Contact
          </Link>
          <a href="mailto:inv.org@gmail.com" className="footer-link">
            Email us
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
