import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { doctorAPI, departmentAPI } from '../services/api';
import { FiSearch, FiStar, FiDollarSign, FiClock } from 'react-icons/fi';
import './Doctors.css';

const Doctors = () => {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    department: searchParams.get('department') || '',
    available: true
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [filters.department, pagination.page]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll({ limit: 50, active: true });
      setDepartments(response.data.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 9,
        available: filters.available
      };
      
      if (filters.department) {
        params.department = filters.department;
      }
      
      if (filters.search) {
        params.search = filters.search;
      }

      const response = await doctorAPI.getAll(params);
      setDoctors(response.data.data);
      setPagination({
        ...pagination,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <div className="doctors-page">
      <div className="container">
        <div className="page-header">
          <h1>Find a Doctor</h1>
          <p>Book appointments with qualified healthcare professionals</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-bar">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name or specialization..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="form-control"
              />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div className="filter-options">
            <select
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : doctors.length === 0 ? (
          <div className="empty-state">
            <h3>No doctors found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="doctors-grid">
              {doctors.map((doctor) => (
                <div key={doctor._id} className="doctor-card">
                  <div className="doctor-card-header">
                    <div className="doctor-avatar">
                      {doctor.user?.name?.charAt(0).toUpperCase() || 'D'}
                    </div>
                    <div className="doctor-rating">
                      <FiStar className="star-icon" />
                      <span>{doctor.rating?.toFixed(1) || '4.5'}</span>
                    </div>
                  </div>
                  
                  <div className="doctor-card-body">
                    <h3>{doctor.user?.name || 'Doctor'}</h3>
                    <p className="doctor-specialization">{doctor.specialization}</p>
                    <p className="doctor-department">{doctor.department?.name}</p>
                    
                    <div className="doctor-meta">
                      <div className="meta-item">
                        <FiClock />
                        <span>{doctor.experience} years exp.</span>
                      </div>
                      <div className="meta-item">
                        <FiDollarSign />
                        <span>Rs. {doctor.consultationFee}</span>
                      </div>
                    </div>
                  </div>

                  <div className="doctor-card-footer">
                    <Link 
                      to={`/doctors/${doctor._id}`} 
                      className="btn btn-outline btn-sm"
                    >
                      View Profile
                    </Link>
                    <Link 
                      to={`/book-appointment/${doctor._id}`} 
                      className="btn btn-primary btn-sm"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPagination({ ...pagination, page: i + 1 })}
                    className={pagination.page === i + 1 ? 'active' : ''}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Doctors;
