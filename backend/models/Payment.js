const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    paymentMethod: { type: String, enum: ['stripe', 'paypal'], required: true },
    paymentType: {
      type: String,
      enum: ['subscription', 'featured_listing', 'agent_membership', 'property_purchase', 'rent'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: { type: String },
    stripePaymentIntentId: String,
    paypalOrderId: String,
    invoiceNumber: { type: String, unique: true },
    description: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

paymentSchema.pre('save', async function () {
  if (!this.invoiceNumber) {
    this.invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
