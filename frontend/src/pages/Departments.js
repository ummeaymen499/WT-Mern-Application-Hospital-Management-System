import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { departmentAPI } from '../services/api';
import { FiSearch } from 'react-icons/fi';
import './Departments.css';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll({ limit: 50, active: true });
      setDepartments(response.data.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const departmentIcons = {
    'Cardiology': '❤️',
    'Dermatology': '🧴',
    'Orthopedics': '🦴',
    'Pediatrics': '👶',
    'Neurology': '🧠',
    'General Medicine': '🩺'
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="departments-page">
      <div className="container">
        <div className="page-header">
          <h1>Our Departments</h1>
          <p>Explore our specialized medical departments</p>
        </div>

        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>

        {filteredDepartments.length === 0 ? (
          <div className="empty-state">
            <h3>No departments found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="departments-list">
            {filteredDepartments.map((dept) => (
              <div key={dept._id} className="department-item">
                <div className="department-icon">
                  {departmentIcons[dept.name] || '🏥'}
                </div>
                <div className="department-info">
                  <h3>{dept.name}</h3>
                  <p>{dept.description}</p>
                </div>
                <Link 
                  to={`/doctors?department=${dept._id}`} 
                  className="btn btn-primary"
                >
                  View Doctors
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Departments;
