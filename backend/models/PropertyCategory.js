const mongoose = require('mongoose');

const propertyCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String },
    icon: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

propertyCategorySchema.pre('save', function () {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
});

module.exports = mongoose.model('PropertyCategory', propertyCategorySchema);
