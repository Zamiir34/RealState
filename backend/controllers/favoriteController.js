const Favorite = require('../models/Favorite');
const asyncHandler = require('../utils/asyncHandler');
const { ErrorResponse } = require('../middleware/errorHandler');

exports.addFavorite = asyncHandler(async (req, res, next) => {
  const existing = await Favorite.findOne({ user: req.user.id, property: req.params.propertyId });
  if (existing) return next(new ErrorResponse('Property already in favorites', 400));

  const favorite = await Favorite.create({ user: req.user.id, property: req.params.propertyId });
  res.status(201).json({ success: true, data: favorite });
});

exports.removeFavorite = asyncHandler(async (req, res, next) => {
  const favorite = await Favorite.findOneAndDelete({ user: req.user.id, property: req.params.propertyId });
  if (!favorite) return next(new ErrorResponse('Favorite not found', 404));
  res.status(200).json({ success: true, message: 'Removed from favorites' });
});

exports.getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user.id })
    .populate({
      path: 'property',
      populate: { path: 'owner', select: 'name' },
    })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: favorites.length,
    data: favorites.map((f) => f.property).filter(Boolean),
  });
});

exports.checkFavorite = asyncHandler(async (req, res) => {
  const favorite = await Favorite.findOne({ user: req.user.id, property: req.params.propertyId });
  res.status(200).json({ success: true, isFavorite: !!favorite });
});
