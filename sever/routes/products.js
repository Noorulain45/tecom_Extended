const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  addReview, getVariant, addVariant, updateVariant,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);
router.get('/:id/variants/:variantId', getVariant);

// User routes (authenticated)
router.post('/:id/reviews', protect, addReview);

// Admin routes
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.post('/:id/variants', protect, adminOnly, addVariant);
router.put('/:id/variants/:variantId', protect, adminOnly, updateVariant);

module.exports = router;
