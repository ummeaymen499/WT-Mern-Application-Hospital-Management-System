import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI, doctorAPI, departmentAPI, appointmentAPI } from '../../services/api';
import { FiUsers, FiUserCheck, FiGrid, FiCalendar, FiDollarSign, FiArrowRight } from 'react-icons/fi';
import './Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalDepartments: 0,
    totalAppointments: 0,
    totalRevenue: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, doctorsRes, deptsRes, aptsRes, statsRes] = await Promise.all([
        userAPI.getAll({ limit: 1 }),
        doctorAPI.getAll({ limit: 1 }),
        departmentAPI.getAll({ limit: 1 }),
        appointmentAPI.getAll({ limit: 5 }),
        appointmentAPI.getStats()
      ]);

      setStats({
        totalUsers: usersRes.data.total,
        totalDoctors: doctorsRes.data.total,
        totalDepartments: deptsRes.data.total,
        totalAppointments: statsRes.data.data.byStatus.reduce((acc, s) => acc + s.count, 0),
        totalRevenue: statsRes.data.data.totalRevenue
      });

      setRecentAppointments(aptsRes.data.data);
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
            <h1>Admin Dashboard</h1>
            <p>Welcome back, {user?.name}!</p>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="admin-stats">
          <div className="admin-stat-card">
            <FiUsers size={32} />
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>

          <div className="admin-stat-card secondary">
            <FiUserCheck size={32} />
            <h3>{stats.totalDoctors}</h3>
            <p>Doctors</p>
          </div>

          <div className="admin-stat-card warning">
            <FiGrid size={32} />
            <h3>{stats.totalDepartments}</h3>
            <p>Departments</p>
          </div>

          <div className="admin-stat-card danger">
            <FiCalendar size={32} />
            <h3>{stats.totalAppointments}</h3>
            <p>Total Appointments</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="dashboard-section">
          <h2>Quick Management</h2>
          <div className="quick-actions">
            <Link to="/admin/users" className="action-card">
              <div className="action-icon">👥</div>
              <h4>Manage Users</h4>
              <p>View and manage all users</p>
            </Link>
            <Link to="/admin/doctors" className="action-card">
              <div className="action-icon">👨‍⚕️</div>
              <h4>Manage Doctors</h4>
              <p>Add or edit doctor profiles</p>
            </Link>
            <Link to="/admin/departments" className="action-card">
              <div className="action-icon">🏥</div>
              <h4>Departments</h4>
              <p>Manage medical departments</p>
            </Link>
            <Link to="/profile" className="action-card">
              <div className="action-icon">⚙️</div>
              <h4>Settings</h4>
              <p>Update system settings</p>
            </Link>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Appointments</h2>
          </div>

          <div className="card">
            {recentAppointments.length === 0 ? (
              <div className="empty-state">
                <h3>No appointments yet</h3>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAppointments.map((apt) => (
                      <tr key={apt._id}>
                        <td>{apt.patient?.name || 'Patient'}</td>
                        <td>{apt.doctor?.user?.name || 'Doctor'}</td>
                        <td>{new Date(apt.appointmentDate).toLocaleDateString()}</td>
                        <td>{getStatusBadge(apt.status)}</td>
                        <td>Rs. {apt.fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
