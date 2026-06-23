let stripe = null;
const getStripe = () => {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};
const Payment = require('../models/Payment');
const Property = require('../models/Property');
const Agent = require('../models/Agent');
const asyncHandler = require('../utils/asyncHandler');
const { ErrorResponse } = require('../middleware/errorHandler');
const { client, paypal } = require('../config/paypal');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');
const createNotification = require('../utils/createNotification');

exports.createStripePayment = asyncHandler(async (req, res, next) => {
  const { amount, paymentType, propertyId, description } = req.body;

  const stripeClient = getStripe();
  if (!stripeClient) return next(new ErrorResponse('Stripe is not configured', 503));

  const paymentIntent = await stripeClient.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    metadata: { userId: req.user.id, paymentType, propertyId: propertyId || '' },
  });

  const payment = await Payment.create({
    user: req.user.id,
    property: propertyId,
    amount,
    paymentMethod: 'stripe',
    paymentType,
    status: 'pending',
    stripePaymentIntentId: paymentIntent.id,
    description,
  });

  res.status(200).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentId: payment._id,
  });
});

exports.confirmStripePayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return next(new ErrorResponse('Payment not found', 404));

  const stripeClient = getStripe();
  if (!stripeClient) return next(new ErrorResponse('Stripe is not configured', 503));

  const intent = await stripeClient.paymentIntents.retrieve(payment.stripePaymentIntentId);
  if (intent.status === 'succeeded') {
    payment.status = 'completed';
    payment.transactionId = intent.id;
    await payment.save();
    await handlePaymentSuccess(payment, req.user);
  }

  res.status(200).json({ success: true, data: payment });
});

exports.createPayPalOrder = asyncHandler(async (req, res, next) => {
  const { amount, paymentType, propertyId, description } = req.body;

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: { currency_code: 'USD', value: amount.toFixed(2) },
      description: description || paymentType,
    }],
  });

  const order = await client().execute(request);

  const payment = await Payment.create({
    user: req.user.id,
    property: propertyId,
    amount,
    paymentMethod: 'paypal',
    paymentType,
    status: 'pending',
    paypalOrderId: order.result.id,
    description,
  });

  res.status(200).json({
    success: true,
    orderId: order.result.id,
    paymentId: payment._id,
  });
});

exports.capturePayPalPayment = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;
  const payment = await Payment.findOne({ paypalOrderId: orderId });
  if (!payment) return next(new ErrorResponse('Payment not found', 404));

  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});
  const capture = await client().execute(request);

  if (capture.result.status === 'COMPLETED') {
    payment.status = 'completed';
    payment.transactionId = capture.result.id;
    await payment.save();
    await handlePaymentSuccess(payment, req.user);
  }

  res.status(200).json({ success: true, data: payment });
});

const handlePaymentSuccess = async (payment, user) => {
  await sendEmail({
    email: user.email,
    subject: 'Payment Confirmation - RealP Estate',
    html: emailTemplates.paymentConfirmation(user.name, payment.amount, payment.invoiceNumber),
  });
  await createNotification(user._id, 'Payment Successful', `Payment of $${payment.amount} confirmed.`, 'payment');

  if (payment.paymentType === 'featured_listing' && payment.property) {
    await Property.findByIdAndUpdate(payment.property, {
      isFeatured: true,
      featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  }
  if (payment.paymentType === 'agent_membership') {
    const agent = await Agent.findOne({ user: user._id });
    if (agent) {
      agent.membershipPlan = payment.metadata?.plan || 'premium';
      agent.membershipExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      await agent.save();
    }
  }
};

exports.getPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const filter = req.user.role === 'admin' ? {} : { user: req.user.id };
  if (status) filter.status = status;
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find(filter).populate('user', 'name email').populate('property', 'title').sort('-createdAt').skip(skip).limit(Number(limit)),
    Payment.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, count: payments.length, total, pages: Math.ceil(total / limit), data: payments });
});

exports.getPayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id).populate('user', 'name email').populate('property', 'title');
  if (!payment) return next(new ErrorResponse('Payment not found', 404));
  res.status(200).json({ success: true, data: payment });
});

exports.getSubscriptionPlans = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      featuredListing: { name: 'Featured Listing', price: 49.99, duration: '30 days' },
      agentMembership: {
        basic: { name: 'Basic', price: 29.99, duration: '1 month' },
        premium: { name: 'Premium', price: 79.99, duration: '1 month' },
        enterprise: { name: 'Enterprise', price: 199.99, duration: '1 month' },
      },
    },
  });
});
