const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  weight:        { type: String },
  priceModifier: { type: Number, default: 0 },
  stock:         { type: Number, required: true, default: 0, min: 0 },
  sku:           { type: String, unique: true, sparse: true },
});

const reviewSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:    { type: String, required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name:             { type: String, required: true, trim: true },
    description:      { type: String, required: true },
    shortDescription: { type: String },
    basePrice:        { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['green-tea', 'black-tea', 'herbal-tea', 'oolong-tea', 'white-tea', 'chai', 'matcha'],
    },
    flavor:       [{ type: String }],
    origin:       { type: String },
    images:       [{ type: String }],
    thumbnail:    { type: String },
    variants:     [variantSchema],
    reviews:      [reviewSchema],
    rating:       { type: Number, default: 0 },
    numReviews:   { type: Number, default: 0 },
    isFeatured:   { type: Boolean, default: false },
    isActive:     { type: Boolean, default: true },
    tags:         [{ type: String }],
    brewingTime:  { type: String },
    temperature:  { type: String },
    caffeineLevel:{ type: String, enum: ['none', 'low', 'medium', 'high'] },
  },
  { timestamps: true }
);

productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating    = 0;
    this.numReviews = 0;
  } else {
    const total    = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.rating    = Math.round((total / this.reviews.length) * 10) / 10;
    this.numReviews = this.reviews.length;
  }
};

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);