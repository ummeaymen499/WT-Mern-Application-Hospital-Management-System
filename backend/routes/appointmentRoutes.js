const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getAvailableSlots,
  getAppointmentStats
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

// Public route for checking available slots
router.get('/available-slots/:doctorId/:date', getAvailableSlots);

// Protected routes
router.use(protect);

router.route('/')
  .get(getAppointments)
  .post(authorize('patient'), createAppointment);

router.get('/stats', authorize('admin'), getAppointmentStats);

router.route('/:id')
  .get(getAppointment)
  .put(updateAppointment);

router.put('/:id/status', authorize('doctor', 'admin'), updateAppointmentStatus);
router.put('/:id/cancel', cancelAppointment);

module.exports = router;
