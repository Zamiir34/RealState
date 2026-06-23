const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    country: { type: String, required: true, trim: true },
    zipCode: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

locationSchema.index({ city: 1, country: 1 });

module.exports = mongoose.model('Location', locationSchema);
