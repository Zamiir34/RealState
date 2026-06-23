const express = require('express');
const {
  createStripePayment, confirmStripePayment, createPayPalOrder,
  capturePayPalPayment, getPayments, getPayment, getSubscriptionPlans,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/plans', getSubscriptionPlans);

router.use(protect);

router.get('/', getPayments);
router.get('/:id', getPayment);
router.post('/stripe/create', createStripePayment);
router.put('/stripe/:id/confirm', confirmStripePayment);
router.post('/paypal/create', createPayPalOrder);
router.post('/paypal/capture', capturePayPalPayment);

module.exports = router;
