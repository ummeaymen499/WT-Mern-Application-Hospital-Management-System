import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI } from '../../services/api';
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiArrowRight } from 'react-icons/fi';
import './Dashboard.css';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await appointmentAPI.getAll({ limit: 100 });
      const appointments = response.data.data;

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = appointments.filter(apt => 
        new Date(apt.appointmentDate) >= today && 
        ['pending', 'confirmed'].includes(apt.status)
      ).length;

      const completed = appointments.filter(apt => apt.status === 'completed').length;
      const cancelled = appointments.filter(apt => apt.status === 'cancelled').length;

      setStats({
        total: appointments.length,
        upcoming,
        completed,
        cancelled
      });

      // Get recent appointments
      setRecentAppointments(appointments.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'badge-warning',
      confirmed: 'badge-primary',
      completed: 'badge-success',
      cancelled: 'badge-danger',
      'no-show': 'badge-secondary'
    };
    return <span className={`badge ${statusClasses[status]}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome, {user?.name}!</h1>
            <p>Manage your appointments and health records</p>
          </div>
          <Link to="/doctors" className="btn btn-primary">
            <FiCalendar /> Book Appointment
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <FiCalendar />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Appointments</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon upcoming">
              <FiClock />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.upcoming}</span>
              <span className="stat-label">Upcoming</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed">
              <FiCheckCircle />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon cancelled">
              <FiXCircle />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.cancelled}</span>
              <span className="stat-label">Cancelled</span>
            </div>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Appointments</h2>
            <Link to="/patient/appointments" className="view-all-link">
              View All <FiArrowRight />
            </Link>
          </div>

          <div className="card">
            {recentAppointments.length === 0 ? (
              <div className="empty-state">
                <FiCalendar />
                <h3>No appointments yet</h3>
                <p>Book your first appointment with a doctor</p>
                <Link to="/doctors" className="btn btn-primary">
                  Find a Doctor
                </Link>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Department</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAppointments.map((apt) => (
                      <tr key={apt._id}>
                        <td>
                          <div className="doctor-cell">
                            <div className="avatar avatar-sm">
                              {apt.doctor?.user?.name?.charAt(0) || 'D'}
                            </div>
                            <span>{apt.doctor?.user?.name || 'Doctor'}</span>
                          </div>
                        </td>
                        <td>{apt.doctor?.department?.name}</td>
                        <td>{new Date(apt.appointmentDate).toLocaleDateString()}</td>
                        <td>{apt.timeSlot?.startTime}</td>
                        <td>{getStatusBadge(apt.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/doctors" className="action-card">
              <div className="action-icon">👨‍⚕️</div>
              <h4>Find Doctor</h4>
              <p>Search for doctors by specialty</p>
            </Link>
            <Link to="/departments" className="action-card">
              <div className="action-icon">🏥</div>
              <h4>Departments</h4>
              <p>Browse our medical departments</p>
            </Link>
            <Link to="/patient/appointments" className="action-card">
              <div className="action-icon">📅</div>
              <h4>My Appointments</h4>
              <p>View all your appointments</p>
            </Link>
            <Link to="/profile" className="action-card">
              <div className="action-icon">👤</div>
              <h4>Profile</h4>
              <p>Update your profile details</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
