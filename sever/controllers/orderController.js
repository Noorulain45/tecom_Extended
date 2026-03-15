const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @POST /api/orders — place order
exports.placeOrder = async (req, res) => {
  const { shippingAddress, paymentMethod = 'cod', notes } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ success: false, message: 'Cart is empty' });

    // Backend: validate all items, prices, and stock
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `Product "${item.product.name}" is no longer available` });
      }

      let variantInfo = null;
      if (item.variant?.variantId) {
        const variant = product.variants.id(item.variant.variantId);
        if (!variant) return res.status(400).json({ success: false, message: 'Variant no longer available' });
        if (variant.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Only ${variant.stock} of "${product.name} (${variant.name})" in stock`,
          });
        }
        variantInfo = { variantId: variant._id, name: variant.name, priceModifier: variant.priceModifier };
      }

      const price = product.basePrice + (variantInfo?.priceModifier || 0);
      subtotal += price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        thumbnail: product.thumbnail,
        variant: variantInfo,
        quantity: item.quantity,
        price,
      });
    }

    const shippingCost = subtotal >= 50 ? 0 : 5; // Free shipping over $50
    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% tax
    const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal: Math.round(subtotal * 100) / 100,
      shippingCost,
      tax,
      total,
      notes,
    });

    // Decrement stock for each variant
    for (const item of cart.items) {
      if (item.variant?.variantId) {
        await Product.findOneAndUpdate(
          { _id: item.product._id, 'variants._id': item.variant.variantId },
          { $inc: { 'variants.$.stock': -item.quantity } }
        );
      }
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/orders — user's order history
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const filter = { user: req.user._id };
    if (status) filter.orderStatus = status;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort('-createdAt').skip(skip).limit(limitNum),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    // Users can only see their own orders
    if (req.user.role === 'user' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/orders/:id/cancel — user can cancel pending orders
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (!['pending', 'confirmed'].includes(order.orderStatus))
      return res.status(400).json({ success: false, message: 'Cannot cancel order at this stage' });

    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || 'Cancelled by user';

    // Restore stock
    for (const item of order.items) {
      if (item.variant?.variantId) {
        await Product.findOneAndUpdate(
          { _id: item.product, 'variants._id': item.variant.variantId },
          { $inc: { 'variants.$.stock': item.quantity } }
        );
      }
    }

    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
