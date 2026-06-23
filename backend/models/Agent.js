const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    licenseNumber: { type: String, required: true, unique: true },
    agency: { type: String, trim: true },
    bio: { type: String, maxlength: 1000 },
    specializations: [{ type: String }],
    experience: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    propertiesSold: { type: Number, default: 0 },
    propertiesRented: { type: Number, default: 0 },
    commission: { type: Number, default: 3 },
    isApproved: { type: Boolean, default: false },
    membershipPlan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free',
    },
    membershipExpiry: Date,
    socialLinks: {
      website: String,
      linkedin: String,
      facebook: String,
      instagram: String,
    },
    serviceAreas: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Agent', agentSchema);
