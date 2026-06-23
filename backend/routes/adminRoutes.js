const express = require('express');
const {
  getCategories, createCategory, updateCategory, deleteCategory,
  getLocations, createLocation, updateLocation, deleteLocation,
  getAdvertisements, createAdvertisement, updateAdvertisement, deleteAdvertisement,
  getSettings, updateSettings,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public
router.get('/categories', getCategories);
router.get('/locations', getLocations);
router.get('/advertisements', getAdvertisements);
router.get('/settings', getSettings);

// Admin only
router.post('/categories', protect, authorize('admin'), createCategory);
router.put('/categories/:id', protect, authorize('admin'), updateCategory);
router.delete('/categories/:id', protect, authorize('admin'), deleteCategory);

router.post('/locations', protect, authorize('admin'), createLocation);
router.put('/locations/:id', protect, authorize('admin'), updateLocation);
router.delete('/locations/:id', protect, authorize('admin'), deleteLocation);

router.post('/advertisements', protect, authorize('admin'), upload.single('image'), createAdvertisement);
router.put('/advertisements/:id', protect, authorize('admin'), updateAdvertisement);
router.delete('/advertisements/:id', protect, authorize('admin'), deleteAdvertisement);

router.put('/settings', protect, authorize('admin'), updateSettings);

module.exports = router;
