const Review = require('../models/Review');
const Property = require('../models/Property');
const Agent = require('../models/Agent');
const asyncHandler = require('../utils/asyncHandler');
const { ErrorResponse } = require('../middleware/errorHandler');

const updatePropertyRating = async (propertyId) => {
  const reviews = await Review.find({ property: propertyId, isApproved: true });
  if (reviews.length === 0) return;
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await Property.findByIdAndUpdate(propertyId, { rating: avg.toFixed(1), reviewCount: reviews.length });
};

const updateAgentRating = async (agentId) => {
  const reviews = await Review.find({ agent: agentId, isApproved: true });
  if (reviews.length === 0) return;
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await Agent.findByIdAndUpdate(agentId, { rating: avg.toFixed(1), reviewCount: reviews.length });
};

exports.createReview = asyncHandler(async (req, res, next) => {
  const { property, agent, rating, title, comment } = req.body;
  if (!property && !agent) return next(new ErrorResponse('Property or agent is required', 400));

  const review = await Review.create({
    user: req.user.id,
    property,
    agent,
    rating,
    title,
    comment,
  });

  await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, data: review });
});

exports.getPropertyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ property: req.params.propertyId, isApproved: true })
    .populate('user', 'name avatar')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

exports.getAgentReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ agent: req.params.agentId, isApproved: true })
    .populate('user', 'name avatar')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

exports.getAllReviews = asyncHandler(async (req, res) => {
  const { isApproved, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'name')
      .populate('property', 'title')
      .populate({ path: 'agent', populate: { path: 'user', select: 'name' } })
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, count: reviews.length, total, pages: Math.ceil(total / limit), data: reviews });
});

exports.moderateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new ErrorResponse('Review not found', 404));

  review.isApproved = req.body.isApproved;
  review.isModerated = true;
  review.moderationNote = req.body.note;
  await review.save();

  if (review.isApproved) {
    if (review.property) await updatePropertyRating(review.property);
    if (review.agent) await updateAgentRating(review.agent);
  }

  res.status(200).json({ success: true, data: review });
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new ErrorResponse('Review not found', 404));

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 403));
  }

  await review.deleteOne();
  res.status(200).json({ success: true, message: 'Review deleted' });
});
