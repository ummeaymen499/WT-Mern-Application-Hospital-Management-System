import React, { useState, useEffect } from 'react';
import { appointmentAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiCalendar, FiClock, FiCheck, FiX, FiUser, FiFileText, FiFilter } from 'react-icons/fi';
import './DoctorAppointments.css';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: '',
    prescription: '',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, [filter, dateFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filter !== 'all') params.status = filter;
      if (dateFilter) params.date = dateFilter;

      const response = await appointmentAPI.getAll(params);
      setAppointments(response.data.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await appointmentAPI.updateStatus(appointmentId, { status });
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update appointment status');
    }
  };

  const handleCompleteAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      await appointmentAPI.update(selectedAppointment._id, {
        status: 'completed',
        ...prescriptionData
      });
      toast.success('Appointment completed successfully');
      setSelectedAppointment(null);
      setPrescriptionData({ diagnosis: '', prescription: '', notes: '' });
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to complete appointment');
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
    <div className="doctor-appointments-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Manage Appointments</h1>
            <p>View and manage your patient appointments</p>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-group">
            <FiFilter />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="form-control"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="filter-group">
            <FiCalendar />
            <input
              type="date"
              className="form-control"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          {dateFilter && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setDateFilter('')}
            >
              Clear Date
            </button>
          )}
        </div>

        {/* Appointments Table */}
        {appointments.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <FiCalendar size={48} />
              <h3>No appointments found</h3>
              <p>No appointments match your current filters</p>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date & Time</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt._id}>
                      <td>
                        <div className="patient-info">
                          <div className="avatar-sm">
                            {apt.patient?.name?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <strong>{apt.patient?.name || 'Patient'}</strong>
                            <small className="text-muted d-block">{apt.patient?.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="datetime-cell">
                          <span className="date">
                            <FiCalendar />
                            {new Date(apt.appointmentDate).toLocaleDateString()}
                          </span>
                          <span className="time">
                            <FiClock />
                            {apt.timeSlot?.startTime} - {apt.timeSlot?.endTime}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="capitalize">{apt.type?.replace('-', ' ')}</span>
                      </td>
                      <td>{getStatusBadge(apt.status)}</td>
                      <td>
                        <div className="action-buttons">
                          {apt.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                                title="Confirm"
                              >
                                <FiCheck />
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleStatusUpdate(apt._id, 'cancelled')}
                                title="Cancel"
                              >
                                <FiX />
                              </button>
                            </>
                          )}
                          {apt.status === 'confirmed' && (
                            <>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setSelectedAppointment(apt)}
                                title="Complete"
                              >
                                <FiFileText /> Complete
                              </button>
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => handleStatusUpdate(apt._id, 'no-show')}
                                title="No Show"
                              >
                                <FiUser /> No Show
                              </button>
                            </>
                          )}
                          {apt.status === 'completed' && apt.prescription && (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => setSelectedAppointment(apt)}
                              title="View Details"
                            >
                              View Details
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Complete/View Appointment Modal */}
        {selectedAppointment && (
          <div className="modal-overlay">
            <div className="modal modal-lg">
              <div className="modal-header">
                <h2>
                  {selectedAppointment.status === 'completed'
                    ? 'Appointment Details'
                    : 'Complete Appointment'}
                </h2>
                <button
                  className="modal-close"
                  onClick={() => {
                    setSelectedAppointment(null);
                    setPrescriptionData({ diagnosis: '', prescription: '', notes: '' });
                  }}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                {/* Patient Info */}
                <div className="modal-section">
                  <h3>Patient Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Name</label>
                      <span>{selectedAppointment.patient?.name}</span>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <span>{selectedAppointment.patient?.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Date</label>
                      <span>
                        {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Time</label>
                      <span>
                        {selectedAppointment.timeSlot?.startTime} - {selectedAppointment.timeSlot?.endTime}
                      </span>
                    </div>
                  </div>
                  {selectedAppointment.symptoms && (
                    <div className="symptoms-box">
                      <label>Symptoms</label>
                      <p>{selectedAppointment.symptoms}</p>
                    </div>
                  )}
                </div>

                {/* Prescription Form / View */}
                {selectedAppointment.status === 'completed' ? (
                  <div className="modal-section">
                    <h3>Prescription & Diagnosis</h3>
                    {selectedAppointment.diagnosis && (
                      <div className="prescription-detail">
                        <label>Diagnosis</label>
                        <p>{selectedAppointment.diagnosis}</p>
                      </div>
                    )}
                    {selectedAppointment.prescription && (
                      <div className="prescription-detail">
                        <label>Prescription</label>
                        <p>{selectedAppointment.prescription}</p>
                      </div>
                    )}
                    {selectedAppointment.notes && (
                      <div className="prescription-detail">
                        <label>Notes</label>
                        <p>{selectedAppointment.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="modal-section">
                    <h3>Add Prescription</h3>
                    <div className="form-group">
                      <label>Diagnosis</label>
                      <input
                        type="text"
                        className="form-control"
                        value={prescriptionData.diagnosis}
                        onChange={(e) =>
                          setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })
                        }
                        placeholder="Enter diagnosis"
                      />
                    </div>
                    <div className="form-group">
                      <label>Prescription</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        value={prescriptionData.prescription}
                        onChange={(e) =>
                          setPrescriptionData({ ...prescriptionData, prescription: e.target.value })
                        }
                        placeholder="Enter prescription details"
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label>Additional Notes</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={prescriptionData.notes}
                        onChange={(e) =>
                          setPrescriptionData({ ...prescriptionData, notes: e.target.value })
                        }
                        placeholder="Any additional notes for the patient"
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedAppointment(null);
                    setPrescriptionData({ diagnosis: '', prescription: '', notes: '' });
                  }}
                >
                  Close
                </button>
                {selectedAppointment.status !== 'completed' && (
                  <button className="btn btn-primary" onClick={handleCompleteAppointment}>
                    <FiCheck /> Complete Appointment
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
