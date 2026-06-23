const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    image: { url: String, publicId: String },
    link: String,
    position: { type: String, enum: ['banner', 'sidebar', 'featured', 'popup'], default: 'banner' },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    isActive: { type: Boolean, default: true },
    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Advertisement', advertisementSchema);
