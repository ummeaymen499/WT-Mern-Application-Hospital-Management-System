import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiUsers, FiClock, FiShield, FiHeart, FiActivity } from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const features = [
    {
      icon: <FiCalendar />,
      title: 'Easy Booking',
      description: 'Book appointments with your preferred doctors in just a few clicks'
    },
    {
      icon: <FiUsers />,
      title: 'Expert Doctors',
      description: 'Access to qualified and experienced healthcare professionals'
    },
    {
      icon: <FiClock />,
      title: '24/7 Support',
      description: 'Round the clock support for all your healthcare needs'
    },
    {
      icon: <FiShield />,
      title: 'Secure & Private',
      description: 'Your health data is protected with top-tier security'
    }
  ];

  const departments = [
    { icon: <FiHeart />, name: 'Cardiology', color: '#ef4444' },
    { icon: <FiActivity />, name: 'Neurology', color: '#8b5cf6' },
    { icon: '🦴', name: 'Orthopedics', color: '#f59e0b' },
    { icon: '👶', name: 'Pediatrics', color: '#10b981' },
    { icon: '🧴', name: 'Dermatology', color: '#ec4899' },
    { icon: '🩺', name: 'General Medicine', color: '#3b82f6' }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Your Health, <span>Our Priority</span></h1>
              <p>
                Book appointments with the best doctors in town. Get quality healthcare 
                services from the comfort of your home.
              </p>
              <div className="hero-buttons">
                <Link to="/doctors" className="btn btn-primary btn-lg">
                  Find a Doctor
                </Link>
                <Link to="/departments" className="btn btn-outline btn-lg">
                  View Departments
                </Link>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">Expert Doctors</span>
                </div>
                <div className="stat">
                  <span className="stat-number">10k+</span>
                  <span className="stat-label">Happy Patients</span>
                </div>
                <div className="stat">
                  <span className="stat-number">15+</span>
                  <span className="stat-label">Departments</span>
                </div>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-image-placeholder">
                <span>🏥</span>
                <p>Healthcare Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Us</h2>
            <p>We provide the best healthcare services with modern facilities</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="departments-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Departments</h2>
            <p>Specialized care across various medical fields</p>
          </div>
          <div className="departments-grid">
            {departments.map((dept, index) => (
              <Link to="/departments" key={index} className="department-card">
                <div className="dept-icon" style={{ backgroundColor: `${dept.color}20`, color: dept.color }}>
                  {dept.icon}
                </div>
                <span>{dept.name}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to="/departments" className="btn btn-primary">
              View All Departments
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Book Your Appointment?</h2>
            <p>Join thousands of patients who trust us with their healthcare needs</p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
