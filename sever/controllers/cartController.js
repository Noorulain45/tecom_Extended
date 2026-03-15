const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper: get variant price and validate stock
const validateVariantStock = (product, variantId, quantity) => {
  if (variantId) {
    const variant = product.variants.id(variantId);
    if (!variant) throw { status: 404, message: 'Variant not found' };
    if (variant.stock < quantity) throw { status: 400, message: `Only ${variant.stock} items in stock` };
    return {
      variantId: variant._id,
      name: variant.name,
      priceModifier: variant.priceModifier,
      stock: variant.stock,
    };
  }
  return null;
};

// @GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name thumbnail basePrice isActive');
    if (!cart) return res.json({ success: true, data: { items: [], total: 0 } });

    // Filter out inactive products
    const validItems = cart.items.filter((item) => item.product && item.product.isActive);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const total = validItems.reduce((acc, item) => {
      const price = item.product.basePrice + (item.variant?.priceModifier || 0);
      return acc + price * item.quantity;
    }, 0);

    res.json({ success: true, data: { items: validItems, total: Math.round(total * 100) / 100 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/cart/add
exports.addToCart = async (req, res) => {
  const { productId, variantId, quantity = 1 } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product || !product.isActive)
      return res.status(404).json({ success: false, message: 'Product not found' });

    // Validate variant/stock on backend
    let variantInfo = null;
    try {
      variantInfo = validateVariantStock(product, variantId, quantity);
    } catch (e) {
      return res.status(e.status || 400).json({ success: false, message: e.message });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    // Check if item+variant already exists
    const existingIndex = cart.items.findIndex((item) => {
      const productMatch = item.product.toString() === productId;
      const variantMatch = variantId ? item.variant?.variantId?.toString() === variantId : !item.variant?.variantId;
      return productMatch && variantMatch;
    });

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + quantity;
      // Re-validate stock for updated quantity
      try {
        validateVariantStock(product, variantId, newQty);
      } catch (e) {
        return res.status(e.status || 400).json({ success: false, message: e.message });
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      cart.items.push({
        product: productId,
        variant: variantInfo,
        quantity,
        priceAtAdd: product.basePrice,
      });
    }

    await cart.save();
    res.json({ success: true, message: 'Added to cart', data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/cart/update
exports.updateCartItem = async (req, res) => {
  const { productId, variantId, quantity } = req.body;

  if (quantity < 1) return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Backend stock validation
    try {
      validateVariantStock(product, variantId, quantity);
    } catch (e) {
      return res.status(e.status || 400).json({ success: false, message: e.message });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const itemIndex = cart.items.findIndex((item) => {
      const productMatch = item.product.toString() === productId;
      const variantMatch = variantId ? item.variant?.variantId?.toString() === variantId : !item.variant?.variantId;
      return productMatch && variantMatch;
    });

    if (itemIndex === -1) return res.status(404).json({ success: false, message: 'Item not in cart' });

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    res.json({ success: true, message: 'Cart updated', data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/cart/remove
exports.removeFromCart = async (req, res) => {
  const { productId, variantId } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter((item) => {
      const productMatch = item.product.toString() === productId;
      const variantMatch = variantId ? item.variant?.variantId?.toString() === variantId : !item.variant?.variantId;
      return !(productMatch && variantMatch);
    });

    await cart.save();
    res.json({ success: true, message: 'Item removed', data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/cart/clear
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
