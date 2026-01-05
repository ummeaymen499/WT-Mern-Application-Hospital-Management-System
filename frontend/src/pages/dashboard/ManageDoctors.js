import React, { useState, useEffect } from 'react';
import { doctorAPI, departmentAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiX, FiStar } from 'react-icons/fi';
import './AdminManage.css';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    user: {
      name: '',
      email: '',
      password: '',
      phone: ''
    },
    specialization: '',
    department: '',
    qualifications: '',
    experience: '',
    consultationFee: '',
    bio: ''
  });

  useEffect(() => {
    fetchDoctors();
    fetchDepartments();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await doctorAPI.getAll({ limit: 100 });
      setDoctors(response.data.data);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll({ limit: 100 });
      setDepartments(response.data.data);
    } catch (error) {
      console.error('Failed to load departments');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (doctor = null) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({
        user: {
          name: doctor.user?.name || '',
          email: doctor.user?.email || '',
          password: '',
          phone: doctor.user?.phone || ''
        },
        specialization: doctor.specialization || '',
        department: doctor.department?._id || '',
        qualifications: Array.isArray(doctor.qualifications)
          ? doctor.qualifications.join(', ')
          : doctor.qualifications || '',
        experience: doctor.experience || '',
        consultationFee: doctor.consultationFee || '',
        bio: doctor.bio || ''
      });
    } else {
      setEditingDoctor(null);
      setFormData({
        user: { name: '', email: '', password: '', phone: '' },
        specialization: '',
        department: '',
        qualifications: '',
        experience: '',
        consultationFee: '',
        bio: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDoctor(null);
    setFormData({
      user: { name: '', email: '', password: '', phone: '' },
      specialization: '',
      department: '',
      qualifications: '',
      experience: '',
      consultationFee: '',
      bio: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('user.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        user: { ...formData.user, [field]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dataToSend = {
        ...formData,
        qualifications: formData.qualifications ? formData.qualifications.split(',').map((q) => q.trim()).filter(q => q) : [],
        experience: Number(formData.experience) || 0,
        consultationFee: Number(formData.consultationFee) || 0
      };

      if (editingDoctor) {
        await doctorAPI.update(editingDoctor._id, dataToSend);
        toast.success('Doctor updated successfully');
      } else {
        await doctorAPI.create(dataToSend);
        toast.success('Doctor created successfully');
      }
      closeModal();
      fetchDoctors();
    } catch (error) {
      console.error('Doctor operation error:', error.response?.data);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await doctorAPI.delete(doctorId);
        toast.success('Doctor deleted successfully');
        fetchDoctors();
      } catch (error) {
        toast.error('Failed to delete doctor');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-manage-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Manage Doctors</h1>
            <p>Add, edit, or remove doctors from the system</p>
          </div>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <FiPlus /> Add Doctor
          </button>
        </div>

        {/* Search */}
        <div className="search-bar">
          <FiSearch />
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or specialization..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        {/* Doctors Table */}
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Department</th>
                  <th>Experience</th>
                  <th>Rating</th>
                  <th>Fee</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar-sm">
                          {doc.user?.name?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <strong>{doc.user?.name}</strong>
                          <small className="text-muted d-block">{doc.user?.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>{doc.specialization}</td>
                    <td>{doc.department?.name || '-'}</td>
                    <td>{doc.experience} years</td>
                    <td>
                      <span className="rating">
                        <FiStar /> {doc.averageRating?.toFixed(1) || 'N/A'}
                      </span>
                    </td>
                    <td>Rs. {doc.consultationFee}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => openModal(doc)}
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(doc._id)}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Doctor Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal modal-lg">
              <div className="modal-header">
                <h2>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
                <button className="modal-close" onClick={closeModal}>
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-section">
                    <h3>User Information</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          name="user.name"
                          className="form-control"
                          value={formData.user.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          name="user.email"
                          className="form-control"
                          value={formData.user.email}
                          onChange={handleChange}
                          required
                          disabled={!!editingDoctor}
                        />
                      </div>
                      {!editingDoctor && (
                        <div className="form-group">
                          <label>Password *</label>
                          <input
                            type="password"
                            name="user.password"
                            className="form-control"
                            value={formData.user.password}
                            onChange={handleChange}
                            required={!editingDoctor}
                            minLength="6"
                          />
                        </div>
                      )}
                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          type="tel"
                          name="user.phone"
                          className="form-control"
                          value={formData.user.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Professional Information</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Specialization *</label>
                        <input
                          type="text"
                          name="specialization"
                          className="form-control"
                          value={formData.specialization}
                          onChange={handleChange}
                          required
                          placeholder="e.g., Cardiologist"
                        />
                      </div>
                      <div className="form-group">
                        <label>Department *</label>
                        <select
                          name="department"
                          className="form-control"
                          value={formData.department}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Experience (years) *</label>
                        <input
                          type="number"
                          name="experience"
                          className="form-control"
                          value={formData.experience}
                          onChange={handleChange}
                          required
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>Consultation Fee (Rs.) *</label>
                        <input
                          type="number"
                          name="consultationFee"
                          className="form-control"
                          value={formData.consultationFee}
                          onChange={handleChange}
                          required
                          min="0"
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Qualifications</label>
                        <input
                          type="text"
                          name="qualifications"
                          className="form-control"
                          value={formData.qualifications}
                          onChange={handleChange}
                          placeholder="MBBS, MD (separate with commas)"
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Bio</label>
                        <textarea
                          name="bio"
                          className="form-control"
                          rows="3"
                          value={formData.bio}
                          onChange={handleChange}
                          placeholder="Brief description about the doctor"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDoctors;
