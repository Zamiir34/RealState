const express = require('express');
const {
  createReview, getPropertyReviews, getAgentReviews,
  getAllReviews, moderateReview, deleteReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/property/:propertyId', getPropertyReviews);
router.get('/agent/:agentId', getAgentReviews);
router.get('/admin/all', protect, authorize('admin'), getAllReviews);

router.post('/', protect, createReview);
router.put('/:id/moderate', protect, authorize('admin'), moderateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
