const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorByUserId,
  getDoctorsByDepartment,
  updateAvailability
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

// Public routes - specific routes MUST come before parameterized routes
router.get('/department/:departmentId', getDoctorsByDepartment);
router.get('/', getDoctors);

// Protected routes - specific routes before /:id
router.get('/user/:userId', protect, getDoctorByUserId);

// Admin only routes
router.post('/', protect, authorize('admin'), createDoctor);

// Parameterized routes LAST
router.get('/:id', getDoctor);
router.put('/:id/availability', protect, authorize('doctor', 'admin'), updateAvailability);
router.put('/:id', protect, authorize('admin', 'doctor'), updateDoctor);
router.delete('/:id', protect, authorize('admin'), deleteDoctor);

module.exports = router;
