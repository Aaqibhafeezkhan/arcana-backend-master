const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem
} = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

// POST /api/cart → Add to cart
router.post('/', protect, addToCart);

// GET /api/cart → Get user cart
router.get('/', protect, getCart);

// PUT /api/cart/:id → Update item quantity
router.put('/:id', protect, updateCartItem);

// DELETE /api/cart/:id → Remove item from cart
router.delete('/:id', protect, removeCartItem);

// Clear all cart items for logged-in user
router.delete('/clear', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const Cart = require('../models/Cart');
    await Cart.deleteMany({ user: userId });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error('Failed to clear cart:', err);
    res.status(500).json({ error: 'Could not clear cart' });
  }
});

module.exports = router;
