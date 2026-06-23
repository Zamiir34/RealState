const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    comment: { type: String, required: true, maxlength: 1000 },
    isApproved: { type: Boolean, default: false },
    isModerated: { type: Boolean, default: false },
    moderationNote: String,
  },
  { timestamps: true }
);

reviewSchema.index({ property: 1, user: 1 }, { unique: true, sparse: true });
reviewSchema.index({ agent: 1, user: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', reviewSchema);
