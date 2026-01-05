import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI, doctorAPI } from '../../services/api';
import { FiCalendar, FiClock, FiCheckCircle, FiUsers, FiArrowRight } from 'react-icons/fi';
import './Dashboard.css';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [stats, setStats] = useState({
    today: 0,
    upcoming: 0,
    completed: 0,
    totalPatients: 0
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  useEffect(() => {
    if (doctorProfile) {
      fetchDashboardData();
    }
  }, [doctorProfile]);

  const fetchDoctorProfile = async () => {
    try {
      const response = await doctorAPI.getByUserId(user.id);
      setDoctorProfile(response.data.data);
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get all appointments
      const allResponse = await appointmentAPI.getAll({ limit: 200 });
      const appointments = allResponse.data.data;

      // Get today's appointments
      const todayResponse = await appointmentAPI.getAll({ date: today, limit: 50 });
      setTodayAppointments(todayResponse.data.data);

      // Calculate stats
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      const todayCount = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === todayDate.getTime() && 
               ['pending', 'confirmed'].includes(apt.status);
      }).length;

      const upcoming = appointments.filter(apt => 
        new Date(apt.appointmentDate) > todayDate && 
        ['pending', 'confirmed'].includes(apt.status)
      ).length;

      const completed = appointments.filter(apt => apt.status === 'completed').length;

      // Get unique patients
      const uniquePatients = new Set(appointments.map(apt => apt.patient?._id)).size;

      setStats({
        today: todayCount,
        upcoming,
        completed,
        totalPatients: uniquePatients
      });
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
            <h1>Welcome, Dr. {user?.name?.split(' ').slice(1).join(' ') || user?.name}!</h1>
            <p>Manage your appointments and patients</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <FiCalendar />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.today}</span>
              <span className="stat-label">Today's Appointments</span>
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
            <div className="stat-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
              <FiUsers />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalPatients}</span>
              <span className="stat-label">Total Patients</span>
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Today's Appointments</h2>
            <Link to="/doctor/appointments" className="view-all-link">
              View All <FiArrowRight />
            </Link>
          </div>

          <div className="card">
            {todayAppointments.length === 0 ? (
              <div className="empty-state">
                <FiCalendar />
                <h3>No appointments today</h3>
                <p>You don't have any appointments scheduled for today</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayAppointments.map((apt) => (
                      <tr key={apt._id}>
                        <td>
                          <div className="doctor-cell">
                            <div className="avatar avatar-sm">
                              {apt.patient?.name?.charAt(0) || 'P'}
                            </div>
                            <span>{apt.patient?.name || 'Patient'}</span>
                          </div>
                        </td>
                        <td>{apt.timeSlot?.startTime} - {apt.timeSlot?.endTime}</td>
                        <td className="capitalize">{apt.type?.replace('-', ' ')}</td>
                        <td>{getStatusBadge(apt.status)}</td>
                        <td>
                          <Link 
                            to={`/doctor/appointments?id=${apt._id}`}
                            className="btn btn-sm btn-secondary"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Doctor Info */}
        {doctorProfile && (
          <div className="dashboard-section">
            <h2>Your Profile</h2>
            <div className="card">
              <div className="card-body">
                <div className="doctor-profile-info">
                  <div className="profile-row">
                    <span className="profile-label">Department:</span>
                    <span>{doctorProfile.department?.name}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Specialization:</span>
                    <span>{doctorProfile.specialization}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Experience:</span>
                    <span>{doctorProfile.experience} years</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Consultation Fee:</span>
                    <span>Rs. {doctorProfile.consultationFee}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Rating:</span>
                    <span>⭐ {doctorProfile.rating?.toFixed(1)} ({doctorProfile.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
