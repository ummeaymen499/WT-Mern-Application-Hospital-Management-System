import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorAPI, reviewAPI } from '../services/api';
import { FiStar, FiClock, FiDollarSign, FiCalendar, FiMapPin, FiPhone } from 'react-icons/fi';
import './DoctorDetail.css';

const DoctorDetail = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDoctorDetails();
    fetchReviews();
  }, [id]);

  const fetchDoctorDetails = async () => {
    try {
      const response = await doctorAPI.getById(id);
      setDoctor(response.data.data);
    } catch (error) {
      console.error('Error fetching doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getDoctorReviews(id, { limit: 10 });
      setReviews(response.data.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Doctor not found</h3>
          <p>The doctor you're looking for doesn't exist</p>
          <Link to="/doctors" className="btn btn-primary">Browse Doctors</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-detail-page">
      <div className="container">
        {/* Doctor Header */}
        <div className="doctor-header card">
          <div className="doctor-header-content">
            <div className="doctor-avatar-large">
              {doctor.user?.name?.charAt(0).toUpperCase() || 'D'}
            </div>
            <div className="doctor-header-info">
              <h1>{doctor.user?.name}</h1>
              <p className="specialization">{doctor.specialization}</p>
              <p className="department">{doctor.department?.name}</p>
              
              <div className="doctor-badges">
                <span className="badge badge-success">
                  <FiClock /> {doctor.experience} Years Experience
                </span>
                <span className="badge badge-warning">
                  <FiStar /> {doctor.rating?.toFixed(1)} ({doctor.totalReviews} reviews)
                </span>
              </div>
            </div>
            <div className="doctor-header-actions">
              <div className="consultation-fee">
                <span className="fee-label">Consultation Fee</span>
                <span className="fee-amount">Rs. {doctor.consultationFee}</span>
              </div>
              <Link 
                to={`/book-appointment/${doctor._id}`} 
                className="btn btn-primary btn-lg"
              >
                <FiCalendar /> Book Appointment
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="doctor-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Schedule
          </button>
          <button
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({doctor.totalReviews})
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="info-card card">
                <div className="card-header">
                  <h3>About Doctor</h3>
                </div>
                <div className="card-body">
                  <p>{doctor.bio || 'No bio available.'}</p>
                </div>
              </div>

              <div className="info-card card">
                <div className="card-header">
                  <h3>Qualifications</h3>
                </div>
                <div className="card-body">
                  <p>{doctor.qualification}</p>
                </div>
              </div>

              <div className="info-card card">
                <div className="card-header">
                  <h3>Contact Information</h3>
                </div>
                <div className="card-body">
                  <div className="contact-info">
                    <div className="contact-item">
                      <FiPhone />
                      <span>{doctor.user?.phone || 'Not available'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="schedule-tab">
              <div className="info-card card">
                <div className="card-header">
                  <h3>Available Days</h3>
                </div>
                <div className="card-body">
                  <div className="available-days">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <span 
                        key={day} 
                        className={`day-badge ${doctor.availableDays?.includes(day) ? 'active' : ''}`}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="info-card card">
                <div className="card-header">
                  <h3>Available Time Slots</h3>
                </div>
                <div className="card-body">
                  <div className="time-slots">
                    {doctor.availableSlots?.map((slot, index) => (
                      <span key={index} className="time-slot">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-tab">
              {reviews.length === 0 ? (
                <div className="empty-state">
                  <h3>No reviews yet</h3>
                  <p>Be the first to review this doctor</p>
                </div>
              ) : (
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div key={review._id} className="review-card card">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">
                            {review.isAnonymous ? 'A' : review.patient?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="reviewer-name">
                              {review.isAnonymous ? 'Anonymous' : review.patient?.name}
                            </p>
                            <p className="review-date">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`star ${i < review.rating ? 'filled' : ''}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;
