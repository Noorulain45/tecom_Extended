const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant: {
    variantId: { type: mongoose.Schema.Types.ObjectId },
    name: String,
    priceModifier: { type: Number, default: 0 },
  },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  priceAtAdd: { type: Number, required: true }, // Snapshot of price when added
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// Virtual for total
cartSchema.virtual('total').get(function () {
  return this.items.reduce((acc, item) => {
    return acc + (item.priceAtAdd + (item.variant?.priceModifier || 0)) * item.quantity;
  }, 0);
});

module.exports = mongoose.model('Cart', cartSchema);
