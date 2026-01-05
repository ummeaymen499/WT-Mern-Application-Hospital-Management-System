import React, { useState, useEffect } from 'react';
import { appointmentAPI, reviewAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiCalendar, FiClock, FiX, FiFilter, FiStar } from 'react-icons/fi';
import './MyAppointments.css';

const MyAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelModal, setCancelModal] = useState({ show: false, appointment: null });
  const [cancelReason, setCancelReason] = useState('');
  const [reviewModal, setReviewModal] = useState({ show: false, appointment: null });
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '', isAnonymous: false });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await appointmentAPI.getAll(params);
      setAppointments(response.data.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancelModal.appointment) return;

    try {
      await appointmentAPI.cancel(cancelModal.appointment._id, { reason: cancelReason });
      toast.success('Appointment cancelled successfully');
      setCancelModal({ show: false, appointment: null });
      setCancelReason('');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to cancel appointment');
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

  const canCancel = (apt) => {
    return ['pending', 'confirmed'].includes(apt.status);
  };

  const canReview = (apt) => {
    return apt.status === 'completed' && !apt.hasReviewed;
  };

  const handleSubmitReview = async () => {
    if (!reviewModal.appointment) return;
    
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      toast.error('Please select a rating between 1 and 5');
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewAPI.create({
        appointmentId: reviewModal.appointment._id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        isAnonymous: reviewData.isAnonymous
      });
      toast.success('Review submitted successfully!');
      setReviewModal({ show: false, appointment: null });
      setReviewData({ rating: 5, comment: '', isAnonymous: false });
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const StarRating = ({ rating, onRatingChange }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn ${star <= rating ? 'active' : ''}`}
            onClick={() => onRatingChange(star)}
          >
            <FiStar fill={star <= rating ? '#ffc107' : 'none'} stroke={star <= rating ? '#ffc107' : '#ccc'} />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="appointments-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>My Appointments</h1>
            <p>View and manage your appointments</p>
          </div>
        </div>

        {/* Filter */}
        <div className="filter-bar">
          <FiFilter />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-control"
          >
            <option value="all">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <FiCalendar size={48} />
              <h3>No appointments found</h3>
              <p>You don't have any {filter !== 'all' ? filter : ''} appointments</p>
            </div>
          </div>
        ) : (
          <div className="appointments-list">
            {appointments.map((apt) => (
              <div key={apt._id} className="appointment-card card">
                <div className="appointment-header">
                  <div className="doctor-info">
                    <div className="avatar">
                      {apt.doctor?.user?.name?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <h3>{apt.doctor?.user?.name || 'Doctor'}</h3>
                      <p>{apt.doctor?.specialization}</p>
                      <p className="text-muted">{apt.doctor?.department?.name}</p>
                    </div>
                  </div>
                  {getStatusBadge(apt.status)}
                </div>

                <div className="appointment-details">
                  <div className="detail-item">
                    <FiCalendar />
                    <span>{new Date(apt.appointmentDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="detail-item">
                    <FiClock />
                    <span>{apt.timeSlot?.startTime} - {apt.timeSlot?.endTime}</span>
                  </div>
                </div>

                <div className="appointment-meta">
                  <div className="meta-row">
                    <span>Type:</span>
                    <span className="capitalize">{apt.type?.replace('-', ' ')}</span>
                  </div>
                  <div className="meta-row">
                    <span>Fee:</span>
                    <span>Rs. {apt.fee}</span>
                  </div>
                  {apt.symptoms && (
                    <div className="meta-row">
                      <span>Symptoms:</span>
                      <span>{apt.symptoms}</span>
                    </div>
                  )}
                </div>

                {/* Prescription if completed */}
                {apt.status === 'completed' && apt.prescription && (
                  <div className="prescription-section">
                    <h4>Prescription</h4>
                    <p>{apt.prescription}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="appointment-actions">
                  {canCancel(apt) && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setCancelModal({ show: true, appointment: apt })}
                    >
                      <FiX /> Cancel Appointment
                    </button>
                  )}
                  {canReview(apt) && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setReviewModal({ show: true, appointment: apt })}
                    >
                      <FiStar /> Write Review
                    </button>
                  )}
                  {apt.status === 'completed' && apt.hasReviewed && (
                    <span className="review-submitted">✓ Review Submitted</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancel Modal */}
        {cancelModal.show && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Cancel Appointment</h2>
                <button
                  className="modal-close"
                  onClick={() => setCancelModal({ show: false, appointment: null })}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to cancel this appointment?</p>
                <div className="form-group">
                  <label>Reason for cancellation</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Optional: Provide a reason for cancellation"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setCancelModal({ show: false, appointment: null })}
                >
                  Keep Appointment
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleCancelAppointment}
                >
                  Cancel Appointment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {reviewModal.show && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Write a Review</h2>
                <button
                  className="modal-close"
                  onClick={() => {
                    setReviewModal({ show: false, appointment: null });
                    setReviewData({ rating: 5, comment: '', isAnonymous: false });
                  }}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="review-doctor-info">
                  <p>Rating for <strong>{reviewModal.appointment?.doctor?.user?.name}</strong></p>
                </div>
                
                <div className="form-group">
                  <label>Your Rating</label>
                  <StarRating
                    rating={reviewData.rating}
                    onRatingChange={(rating) => setReviewData({ ...reviewData, rating })}
                  />
                </div>

                <div className="form-group">
                  <label>Your Review (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    placeholder="Share your experience with this doctor..."
                    maxLength={500}
                  ></textarea>
                  <small className="text-muted">{reviewData.comment.length}/500 characters</small>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={reviewData.isAnonymous}
                      onChange={(e) => setReviewData({ ...reviewData, isAnonymous: e.target.checked })}
                    />
                    Post anonymously
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setReviewModal({ show: false, appointment: null });
                    setReviewData({ rating: 5, comment: '', isAnonymous: false });
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
