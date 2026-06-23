const express = require('express');
const {
  getProperties, getAdminProperties, getProperty, createProperty, updateProperty,
  deleteProperty, approveProperty, rejectProperty, toggleFeatured,
  getSimilarProperties, compareProperties, getMyProperties, sendInquiry,
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getProperties);
router.get('/compare', compareProperties);
router.get('/admin/all', protect, authorize('admin'), getAdminProperties);
router.get('/my/listings', protect, getMyProperties);
router.get('/:id', getProperty);
router.get('/:id/similar', getSimilarProperties);
router.post('/:id/inquiry', protect, sendInquiry);

router.post(
  '/',
  protect,
  authorize('admin', 'agent', 'owner'),
  upload.fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 3 }]),
  createProperty
);
router.put(
  '/:id',
  protect,
  authorize('admin', 'agent', 'owner'),
  upload.fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 3 }]),
  updateProperty
);
router.delete('/:id', protect, authorize('admin', 'agent', 'owner'), deleteProperty);
router.put('/:id/approve', protect, authorize('admin'), approveProperty);
router.put('/:id/reject', protect, authorize('admin'), rejectProperty);
router.put('/:id/featured', protect, authorize('admin'), toggleFeatured);

module.exports = router;
