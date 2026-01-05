const express = require('express');
const router = express.Router();
const {
  getDoctorReviews,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

// Public route
router.get('/doctor/:doctorId', getDoctorReviews);

// Protected routes
router.post('/', protect, authorize('patient'), createReview);
router.put('/:id', protect, authorize('patient'), updateReview);
router.delete('/:id', protect, authorize('patient', 'admin'), deleteReview);

module.exports = router;
