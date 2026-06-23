const Property = require('../models/Property');
const { mapUploadedFiles } = require('../utils/fileUrl');
const { parsePropertyBody, validateLandListing } = require('../utils/parsePropertyBody');
const Agent = require('../models/Agent');
const asyncHandler = require('../utils/asyncHandler');
const { ErrorResponse } = require('../middleware/errorHandler');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');
const createNotification = require('../utils/createNotification');
const User = require('../models/User');

const buildPropertyQuery = (query) => {
  const filter = { isApproved: true, approvalStatus: 'approved' };

  if (query.search) {
    filter.$text = { $search: query.search };
  }
  if (query.propertyType) filter.propertyType = query.propertyType;
  if (query.listingType) filter.listingType = query.listingType;
  if (query.status) filter.status = query.status;
  if (query.city) filter.city = { $regex: query.city, $options: 'i' };
  if (query.country) filter.country = { $regex: query.country, $options: 'i' };
  if (query.bedrooms) filter.bedrooms = { $gte: Number(query.bedrooms) };
  if (query.bathrooms) filter.bathrooms = { $gte: Number(query.bathrooms) };
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }
  if (query.minArea || query.maxArea) {
    filter.areaSize = {};
    if (query.minArea) filter.areaSize.$gte = Number(query.minArea);
    if (query.maxArea) filter.areaSize.$lte = Number(query.maxArea);
  }
  if (query.amenities) {
    const amenitiesList = Array.isArray(query.amenities) ? query.amenities : query.amenities.split(',');
    filter.amenities = { $all: amenitiesList };
  }
  if (query.isFeatured === 'true') filter.isFeatured = true;

  return filter;
};

const getSortOption = (sort) => {
  const sorts = {
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    'area-desc': { areaSize: -1 },
    popular: { views: -1 },
  };
  return sorts[sort] || { createdAt: -1 };
};

exports.getProperties = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, sort } = req.query;
  const filter = buildPropertyQuery(req.query);
  const skip = (page - 1) * limit;

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .populate('owner', 'name email phone avatar')
      .populate({ path: 'agent', populate: { path: 'user', select: 'name email phone avatar' } })
      .populate('category', 'name slug')
      .sort(getSortOption(sort))
      .skip(skip)
      .limit(Number(limit)),
    Property.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: properties.length,
    total,
    pages: Math.ceil(total / limit),
    data: properties,
  });
});

exports.getAdminProperties = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, approvalStatus, status } = req.query;
  const filter = {};
  if (approvalStatus) filter.approvalStatus = approvalStatus;
  if (status) filter.status = status;
  const skip = (page - 1) * limit;

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .populate('owner', 'name email')
      .populate('agent')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Property.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, count: properties.length, total, pages: Math.ceil(total / limit), data: properties });
});

exports.getProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id)
    .populate('owner', 'name email phone avatar')
    .populate({ path: 'agent', populate: { path: 'user', select: 'name email phone avatar' } })
    .populate('category', 'name slug');

  if (!property) return next(new ErrorResponse('Property not found', 404));

  property.views += 1;
  await property.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, data: property });
});

exports.createProperty = asyncHandler(async (req, res, next) => {
  const data = parsePropertyBody({ ...req.body, owner: req.user.id });

  if (!validateLandListing(data, req.files, next)) return;

  if (req.user.role === 'agent') {
    const agent = await Agent.findOne({ user: req.user.id });
    if (agent) data.agent = agent._id;
  }

  if (req.files?.images) {
    data.images = mapUploadedFiles(req.files.images);
  }
  if (req.files?.videos) {
    data.videos = mapUploadedFiles(req.files.videos);
  }
  if (req.body.amenities && typeof req.body.amenities === 'string') {
    data.amenities = JSON.parse(req.body.amenities);
  }

  const property = await Property.create(data);

  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await createNotification(admin._id, 'New Property Listing', `"${property.title}" submitted for approval.`, 'property');
  }

  res.status(201).json({ success: true, data: property });
});

exports.updateProperty = asyncHandler(async (req, res, next) => {
  let property = await Property.findById(req.params.id);
  if (!property) return next(new ErrorResponse('Property not found', 404));

  if (property.owner.toString() !== req.user.id && !['admin', 'agent'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized', 403));
  }

  const updates = parsePropertyBody({ ...req.body });
  if (req.files?.images) {
    updates.images = [...(property.images || []), ...mapUploadedFiles(req.files.images)];
  }
  if (req.body.amenities && typeof req.body.amenities === 'string') {
    updates.amenities = JSON.parse(req.body.amenities);
  }

  property = await Property.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: property });
});

exports.deleteProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);
  if (!property) return next(new ErrorResponse('Property not found', 404));

  if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 403));
  }

  await property.deleteOne();
  res.status(200).json({ success: true, message: 'Property deleted' });
});

exports.approveProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id).populate('owner', 'name email');
  if (!property) return next(new ErrorResponse('Property not found', 404));

  property.isApproved = true;
  property.approvalStatus = 'approved';
  await property.save();

  await sendEmail({
    email: property.owner.email,
    subject: 'Property Approved - RealP Estate',
    html: emailTemplates.propertyApproved(property.owner.name, property.title),
  });
  await createNotification(property.owner._id, 'Property Approved', `"${property.title}" is now live.`, 'success');

  res.status(200).json({ success: true, data: property });
});

exports.rejectProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);
  if (!property) return next(new ErrorResponse('Property not found', 404));

  property.approvalStatus = 'rejected';
  property.rejectionReason = req.body.reason;
  await property.save();

  await createNotification(property.owner, 'Property Rejected', `Your listing was rejected: ${req.body.reason}`, 'warning');
  res.status(200).json({ success: true, data: property });
});

exports.toggleFeatured = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);
  if (!property) return next(new ErrorResponse('Property not found', 404));

  property.isFeatured = !property.isFeatured;
  if (property.isFeatured) {
    property.featuredUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  await property.save();
  res.status(200).json({ success: true, data: property });
});

exports.getSimilarProperties = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);
  if (!property) return next(new ErrorResponse('Property not found', 404));

  const similar = await Property.find({
    _id: { $ne: property._id },
    city: property.city,
    propertyType: property.propertyType,
    isApproved: true,
    status: 'available',
  })
    .limit(4)
    .select('title price images city bedrooms bathrooms areaSize');

  res.status(200).json({ success: true, data: similar });
});

exports.compareProperties = asyncHandler(async (req, res, next) => {
  const ids = req.query.ids?.split(',') || [];
  if (ids.length < 2 || ids.length > 4) {
    return next(new ErrorResponse('Provide 2 to 4 property IDs', 400));
  }

  const properties = await Property.find({ _id: { $in: ids } })
    .populate('owner', 'name')
    .populate({ path: 'agent', populate: { path: 'user', select: 'name' } });

  res.status(200).json({ success: true, data: properties });
});

exports.getMyProperties = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'agent'
    ? { agent: (await Agent.findOne({ user: req.user.id }))?._id }
    : { owner: req.user.id };

  const properties = await Property.find(filter).sort('-createdAt');
  res.status(200).json({ success: true, count: properties.length, data: properties });
});

exports.sendInquiry = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id).populate('owner', 'name email');
  if (!property) return next(new ErrorResponse('Property not found', 404));

  property.inquiries += 1;
  await property.save({ validateBeforeSave: false });

  await sendEmail({
    email: property.owner.email,
    subject: `Inquiry for ${property.title}`,
    html: emailTemplates.propertyInquiry(property.owner.name, property.title, req.body.message),
  });
  await createNotification(property.owner._id, 'New Inquiry', `Inquiry for "${property.title}"`, 'info');

  res.status(200).json({ success: true, message: 'Inquiry sent successfully' });
});
