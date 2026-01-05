import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">🏥</span>
              <span className="logo-text">HealthCare</span>
            </div>
            <p className="footer-description">
              Your trusted partner in healthcare. We provide quality medical services 
              with compassionate care.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link"><FiFacebook /></a>
              <a href="#" className="social-link"><FiTwitter /></a>
              <a href="#" className="social-link"><FiInstagram /></a>
              <a href="#" className="social-link"><FiLinkedin /></a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/departments">Departments</Link></li>
              <li><Link to="/doctors">Find a Doctor</Link></li>
              <li><Link to="/register">Book Appointment</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Our Services</h4>
            <ul className="footer-links">
              <li><a href="#">Emergency Care</a></li>
              <li><a href="#">Online Consultation</a></li>
              <li><a href="#">Health Checkup</a></li>
              <li><a href="#">Specialist Care</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Info</h4>
            <ul className="footer-contact">
              <li>
                <FiMapPin />
                <span>123 Medical Center, Islamabad, Pakistan</span>
              </li>
              <li>
                <FiPhone />
                <span>+92 300 1234567</span>
              </li>
              <li>
                <FiMail />
                <span>info@healthcare.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} HealthCare. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
