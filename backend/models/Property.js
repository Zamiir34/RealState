const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    propertyType: {
      type: String,
      enum: ['house', 'apartment', 'condo', 'villa', 'land', 'commercial', 'office'],
      required: true,
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'PropertyCategory' },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    location: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, required: true },
    zipCode: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    areaSize: { type: Number, required: [true, 'Area/land size is required'], min: 0 },
    areaUnit: { type: String, enum: ['sqft', 'sqm', 'acre', 'hectare'], default: 'sqft' },
    landDimensions: { type: String, trim: true },
    parkingSpaces: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['available', 'sold', 'rented', 'pending', 'off-market'],
      default: 'available',
    },
    listingType: {
      type: String,
      enum: ['sale', 'rent'],
      default: 'sale',
    },
    images: [{ url: String, publicId: String }],
    videos: [{ url: String, publicId: String }],
    virtualTourUrl: { type: String },
    amenities: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    featuredUntil: Date,
    isApproved: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
    views: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
    yearBuilt: Number,
    furnished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

propertySchema.index({ title: 'text', description: 'text', city: 'text', location: 'text' });
propertySchema.index({ price: 1, bedrooms: 1, bathrooms: 1, city: 1, status: 1 });

module.exports = mongoose.model('Property', propertySchema);
