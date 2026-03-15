const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// @GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, category, minPrice, maxPrice,
      rating, flavor, search, sort = '-createdAt',
      featured, caffeineLevel, isFeatured,
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const filter = { isActive: true };

    if (category)     filter.category     = category;
    if (caffeineLevel) filter.caffeineLevel = caffeineLevel;

    // isFeatured filter — supports both 'true' and 'false' strings
    if (isFeatured === 'true'  || featured === 'true')  filter.isFeatured = true;
    if (isFeatured === 'false' || featured === 'false') filter.isFeatured = false;

    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.basePrice.$lte = parseFloat(maxPrice);
    }

    if (rating)  filter.rating = { $gte: parseFloat(rating) };
    if (flavor)  filter.flavor = { $in: flavor.split(',') };
    if (search)  filter.$text  = { $search: search };

    const allowedSorts = {
      'price-asc':  'basePrice',
      'price-desc': '-basePrice',
      'rating-desc':'-rating',
      newest:       '-createdAt',
      oldest:       'createdAt',
      popular:      '-numReviews',
    };
    const sortField = allowedSorts[sort] || sort;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortField).skip(skip).limit(limitNum).select('-reviews'),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);
    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum, limit: limitNum, total, totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name avatar');
    if (!product || !product.isActive)
      return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/products/:id/variants/:variantId
exports.getVariant = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const variant = product.variants.id(req.params.variantId);
    if (!variant)  return res.status(404).json({ success: false, message: 'Variant not found' });
    res.json({
      success: true,
      data: {
        variantId:     variant._id,
        name:          variant.name,
        price:         product.basePrice + variant.priceModifier,
        priceModifier: variant.priceModifier,
        stock:         variant.stock,
        available:     variant.stock > 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/products — admin only
exports.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const product = new Product(req.body);
    const saved   = await product.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/products/:id — admin only
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/products/:id — admin only (soft delete)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.isActive = false;
    await product.save();
    res.json({ success: true, message: 'Product deactivated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/products/:id/reviews — user only
exports.addReview = async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed)
      return res.status(400).json({ success: false, message: 'Already reviewed this product' });
    product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
    product.updateRating();
    await product.save();
    res.status(201).json({ success: true, message: 'Review added' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/products/:id/variants — admin only
exports.addVariant = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.variants.push(req.body);
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/products/:id/variants/:variantId — admin only
exports.updateVariant = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const variant = product.variants.id(req.params.variantId);
    if (!variant) return res.status(404).json({ success: false, message: 'Variant not found' });
    Object.assign(variant, req.body);
    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};