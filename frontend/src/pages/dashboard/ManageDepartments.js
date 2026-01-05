import React, { useState, useEffect } from 'react';
import { departmentAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiX, FiUsers } from 'react-icons/fi';
import './AdminManage.css';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await departmentAPI.getAll({ limit: 100 });
      setDepartments(response.data.data);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (department = null) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        name: department.name || '',
        description: department.description || '',
        icon: department.icon || ''
      });
    } else {
      setEditingDepartment(null);
      setFormData({ name: '', description: '', icon: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDepartment(null);
    setFormData({ name: '', description: '', icon: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingDepartment) {
        await departmentAPI.update(editingDepartment._id, formData);
        toast.success('Department updated successfully');
      } else {
        await departmentAPI.create(formData);
        toast.success('Department created successfully');
      }
      closeModal();
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (departmentId) => {
    if (window.confirm('Are you sure you want to delete this department? This will affect all associated doctors.')) {
      try {
        await departmentAPI.delete(departmentId);
        toast.success('Department deleted successfully');
        fetchDepartments();
      } catch (error) {
        toast.error('Failed to delete department');
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
            <h1>Manage Departments</h1>
            <p>Add, edit, or remove departments from the system</p>
          </div>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <FiPlus /> Add Department
          </button>
        </div>

        {/* Search */}
        <div className="search-bar">
          <FiSearch />
          <input
            type="text"
            className="form-control"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        {/* Departments Grid */}
        <div className="departments-grid">
          {filteredDepartments.map((dept) => (
            <div key={dept._id} className="department-card card">
              <div className="department-icon">
                {dept.icon || '🏥'}
              </div>
              <h3>{dept.name}</h3>
              <p className="department-desc">{dept.description || 'No description'}</p>
              <div className="department-meta">
                <span className="doctors-count">
                  <FiUsers /> {dept.doctorCount || 0} Doctors
                </span>
              </div>
              <div className="department-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => openModal(dept)}
                  title="Edit"
                >
                  <FiEdit2 /> Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(dept._id)}
                  title="Delete"
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Department Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>{editingDepartment ? 'Edit Department' : 'Add New Department'}</h2>
                <button className="modal-close" onClick={closeModal}>
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Department Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Cardiology"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows="4"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Brief description of the department"
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label>Icon (emoji)</label>
                    <input
                      type="text"
                      name="icon"
                      className="form-control"
                      value={formData.icon}
                      onChange={handleChange}
                      placeholder="e.g., ❤️"
                    />
                    <small className="text-muted">You can use an emoji as the department icon</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingDepartment ? 'Update Department' : 'Add Department'}
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

export default ManageDepartments;
