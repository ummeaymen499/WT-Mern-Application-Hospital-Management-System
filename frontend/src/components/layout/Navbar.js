import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiCalendar, FiGrid, FiChevronDown } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    const routes = {
      patient: '/patient/dashboard',
      doctor: '/doctor/dashboard',
      admin: '/admin/dashboard'
    };
    return routes[user.role] || '/';
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">🏥</span>
            <span className="logo-text">HealthCare</span>
          </Link>

          <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/departments" onClick={() => setIsMenuOpen(false)}>Departments</Link>
            <Link to="/doctors" onClick={() => setIsMenuOpen(false)}>Doctors</Link>
            
            {isAuthenticated ? (
              <div className="navbar-user">
                <button 
                  className="user-button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="avatar avatar-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{user?.name}</span>
                  <FiChevronDown className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <p className="dropdown-name">{user?.name}</p>
                      <p className="dropdown-role">{user?.role}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link 
                      to={getDashboardLink()} 
                      className="dropdown-item"
                      onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                    >
                      <FiGrid /> Dashboard
                    </Link>
                    {user?.role === 'patient' && (
                      <Link 
                        to="/patient/appointments" 
                        className="dropdown-item"
                        onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                      >
                        <FiCalendar /> My Appointments
                      </Link>
                    )}
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                    >
                      <FiUser /> Profile
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <FiLogOut /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="navbar-auth">
                <Link to="/login" className="btn btn-secondary" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                  Register
                </Link>
              </div>
            )}
          </div>

          <button 
            className="navbar-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
      
      {/* Overlay for dropdown */}
      {isDropdownOpen && (
        <div 
          className="dropdown-overlay"
          onClick={() => setIsDropdownOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
