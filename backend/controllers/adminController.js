const PropertyCategory = require('../models/PropertyCategory');
const { getFileUrl } = require('../utils/fileUrl');
const Location = require('../models/Location');
const Advertisement = require('../models/Advertisement');
const Settings = require('../models/Settings');
const asyncHandler = require('../utils/asyncHandler');
const { ErrorResponse } = require('../middleware/errorHandler');

// Categories
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await PropertyCategory.find({ isActive: true }).sort('name');
  res.status(200).json({ success: true, data: categories });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await PropertyCategory.create(req.body);
  res.status(201).json({ success: true, data: category });
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await PropertyCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) return next(new ErrorResponse('Category not found', 404));
  res.status(200).json({ success: true, data: category });
});

exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await PropertyCategory.findByIdAndDelete(req.params.id);
  if (!category) return next(new ErrorResponse('Category not found', 404));
  res.status(200).json({ success: true, message: 'Category deleted' });
});

// Locations
exports.getLocations = asyncHandler(async (req, res) => {
  const locations = await Location.find({ isActive: true }).sort('city');
  res.status(200).json({ success: true, data: locations });
});

exports.createLocation = asyncHandler(async (req, res) => {
  const location = await Location.create(req.body);
  res.status(201).json({ success: true, data: location });
});

exports.updateLocation = asyncHandler(async (req, res, next) => {
  const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!location) return next(new ErrorResponse('Location not found', 404));
  res.status(200).json({ success: true, data: location });
});

exports.deleteLocation = asyncHandler(async (req, res, next) => {
  const location = await Location.findByIdAndDelete(req.params.id);
  if (!location) return next(new ErrorResponse('Location not found', 404));
  res.status(200).json({ success: true, message: 'Location deleted' });
});

// Advertisements
exports.getAdvertisements = asyncHandler(async (req, res) => {
  const filter = req.user?.role === 'admin' ? {} : { isActive: true, endDate: { $gte: new Date() } };
  const ads = await Advertisement.find(filter).sort('-createdAt');
  res.status(200).json({ success: true, data: ads });
});

exports.createAdvertisement = asyncHandler(async (req, res) => {
  const data = { ...req.body, createdBy: req.user.id };
  if (req.file) data.image = { url: getFileUrl(req.file), publicId: req.file.filename };
  const ad = await Advertisement.create(data);
  res.status(201).json({ success: true, data: ad });
});

exports.updateAdvertisement = asyncHandler(async (req, res, next) => {
  const ad = await Advertisement.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!ad) return next(new ErrorResponse('Advertisement not found', 404));
  res.status(200).json({ success: true, data: ad });
});

exports.deleteAdvertisement = asyncHandler(async (req, res, next) => {
  const ad = await Advertisement.findByIdAndDelete(req.params.id);
  if (!ad) return next(new ErrorResponse('Advertisement not found', 404));
  res.status(200).json({ success: true, message: 'Advertisement deleted' });
});

// Settings
exports.getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.status(200).json({ success: true, data: settings });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create(req.body);
  else {
    Object.assign(settings, req.body);
    await settings.save();
  }
  res.status(200).json({ success: true, data: settings });
});
