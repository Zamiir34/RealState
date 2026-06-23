const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'RealP Estate' },
    siteDescription: { type: String, default: 'Your trusted real estate platform' },
    contactEmail: { type: String },
    contactPhone: { type: String },
    address: String,
    currency: { type: String, default: 'USD' },
    featuredListingPrice: { type: Number, default: 49.99 },
    agentMembershipPlans: {
      basic: { price: Number, duration: Number },
      premium: { price: Number, duration: Number },
      enterprise: { price: Number, duration: Number },
    },
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
    },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
