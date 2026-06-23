const express = require('express');
const {
  getDashboardStats, getPropertyReport, getSalesReport,
  getRentalReport, getAgentPerformanceReport, getRevenueReport, getChartData,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin', 'agent', 'owner'));

router.get('/dashboard', authorize('admin'), getDashboardStats);
router.get('/charts', authorize('admin'), getChartData);
router.get('/properties', getPropertyReport);
router.get('/sales', getSalesReport);
router.get('/rentals', getRentalReport);
router.get('/agents', authorize('admin'), getAgentPerformanceReport);
router.get('/revenue', authorize('admin'), getRevenueReport);

module.exports = router;
