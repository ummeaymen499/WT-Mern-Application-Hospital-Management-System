import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorAPI, appointmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiCalendar, FiClock, FiUser, FiCheckCircle } from 'react-icons/fi';
import './BookAppointment.css';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    appointmentDate: '',
    timeSlot: null,
    type: 'consultation',
    symptoms: ''
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetchDoctorDetails();
  }, [doctorId]);

  useEffect(() => {
    if (formData.appointmentDate) {
      fetchAvailableSlots();
    }
  }, [formData.appointmentDate]);

  const fetchDoctorDetails = async () => {
    try {
      const response = await doctorAPI.getById(doctorId);
      setDoctor(response.data.data);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      toast.error('Failed to load doctor details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const response = await appointmentAPI.getAvailableSlots(doctorId, formData.appointmentDate);
      setAvailableSlots(response.data.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load available slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (e) => {
    setFormData({
      ...formData,
      appointmentDate: e.target.value,
      timeSlot: null
    });
  };

  const handleSlotSelect = (slot) => {
    setFormData({ ...formData, timeSlot: slot });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.appointmentDate || !formData.timeSlot) {
      toast.error('Please select date and time slot');
      return;
    }

    setSubmitting(true);

    try {
      await appointmentAPI.create({
        doctorId,
        appointmentDate: formData.appointmentDate,
        timeSlot: formData.timeSlot,
        type: formData.type,
        symptoms: formData.symptoms
      });

      toast.success('Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to book appointment';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
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
        </div>
      </div>
    );
  }

  return (
    <div className="book-appointment-page">
      <div className="container">
        <div className="booking-container">
          {/* Doctor Info Sidebar */}
          <div className="doctor-sidebar card">
            <div className="doctor-sidebar-header">
              <div className="doctor-avatar-medium">
                {doctor.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="doctor-info">
                <h3>{doctor.user?.name}</h3>
                <p className="specialization">{doctor.specialization}</p>
                <p className="department">{doctor.department?.name}</p>
              </div>
            </div>
            <div className="doctor-sidebar-details">
              <div className="detail-item">
                <span className="label">Consultation Fee</span>
                <span className="value">Rs. {doctor.consultationFee}</span>
              </div>
              <div className="detail-item">
                <span className="label">Experience</span>
                <span className="value">{doctor.experience} years</span>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="booking-form card">
            <div className="card-header">
              <h2>Book Appointment</h2>
            </div>

            {/* Progress Steps */}
            <div className="booking-steps">
              <div className={`step ${step >= 1 ? 'active' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-label">Select Date</span>
              </div>
              <div className="step-connector"></div>
              <div className={`step ${step >= 2 ? 'active' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-label">Select Time</span>
              </div>
              <div className="step-connector"></div>
              <div className={`step ${step >= 3 ? 'active' : ''}`}>
                <span className="step-number">3</span>
                <span className="step-label">Details</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="card-body">
              {/* Step 1: Date Selection */}
              <div className="form-section">
                <label className="section-label">
                  <FiCalendar /> Select Appointment Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.appointmentDate}
                  onChange={handleDateChange}
                  min={getMinDate()}
                  max={getMaxDate()}
                  required
                />
                <p className="form-help">
                  Available days: {doctor.availableDays?.join(', ')}
                </p>
              </div>

              {/* Step 2: Time Selection */}
              {formData.appointmentDate && (
                <div className="form-section">
                  <label className="section-label">
                    <FiClock /> Select Time Slot
                  </label>
                  
                  {loadingSlots ? (
                    <div className="slots-loading">
                      <div className="spinner"></div>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="no-slots">No slots available for this date</p>
                  ) : (
                    <div className="time-slots-grid">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`slot-btn ${formData.timeSlot?.startTime === slot.startTime ? 'selected' : ''}`}
                          onClick={() => {
                            handleSlotSelect(slot);
                            setStep(3);
                          }}
                        >
                          {slot.startTime} - {slot.endTime}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Additional Details */}
              {formData.timeSlot && (
                <div className="form-section">
                  <label className="section-label">
                    <FiUser /> Appointment Details
                  </label>
                  
                  <div className="form-group">
                    <label>Appointment Type</label>
                    <select
                      className="form-control"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="consultation">Consultation</option>
                      <option value="follow-up">Follow-up</option>
                      <option value="routine-checkup">Routine Checkup</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Symptoms / Reason for Visit</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Describe your symptoms or reason for the appointment..."
                      value={formData.symptoms}
                      onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Booking Summary */}
              {formData.appointmentDate && formData.timeSlot && (
                <div className="booking-summary">
                  <h4>Booking Summary</h4>
                  <div className="summary-item">
                    <span>Date:</span>
                    <span>{new Date(formData.appointmentDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="summary-item">
                    <span>Time:</span>
                    <span>{formData.timeSlot.startTime} - {formData.timeSlot.endTime}</span>
                  </div>
                  <div className="summary-item">
                    <span>Type:</span>
                    <span className="capitalize">{formData.type.replace('-', ' ')}</span>
                  </div>
                  <div className="summary-item total">
                    <span>Total Fee:</span>
                    <span>Rs. {doctor.consultationFee}</span>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary btn-lg book-btn"
                disabled={!formData.appointmentDate || !formData.timeSlot || submitting}
              >
                {submitting ? 'Booking...' : (
                  <>
                    <FiCheckCircle /> Confirm Booking
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
