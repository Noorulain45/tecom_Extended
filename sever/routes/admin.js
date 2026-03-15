const express = require('express');
const router = express.Router();

const {
  getAnalytics,
  getAllUsers,
  toggleBlockUser,
  updateUserRole,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/adminController');

const {
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const { protect, adminOnly, superadminOnly } = require('../middleware/auth');
const Product = require('../models/Product');

router.use(protect);

// ── Analytics ─────────────────────────────────────────────────────────────────
router.get('/analytics', adminOnly, getAnalytics);
router.get('/stats',     adminOnly, getAnalytics);

// ── Products ──────────────────────────────────────────────────────────────────
router.get('/products', adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 15, search = '', category, sort = 'newest' } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name:        { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags:        { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    const sortMap = {
      newest:       { createdAt: -1 },
      oldest:       { createdAt:  1 },
      'price-asc':  { basePrice:  1 },
      'price-desc': { basePrice: -1 },
      name:         { name:       1 },
    };
    const skip     = (Number(page) - 1) * Number(limit);
    const total    = await Product.countDocuments(query);
    const products = await Product
      .find(query)
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-reviews');
    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error('[GET /admin/products]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post  ('/products',     adminOnly, createProduct);
router.put   ('/products/:id', adminOnly, updateProduct);
router.delete('/products/:id', adminOnly, deleteProduct);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users',           adminOnly,      getAllUsers);
router.put('/users/:id/block', adminOnly,      toggleBlockUser);
router.put('/users/:id/role',  superadminOnly, updateUserRole);

// ── Orders ────────────────────────────────────────────────────────────────────
router.get('/orders',            adminOnly, getAllOrders);
router.put('/orders/:id/status', adminOnly, updateOrderStatus);

module.exports = router;