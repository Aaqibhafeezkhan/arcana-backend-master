const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { addToCart, getCart, updateQuantity, removeFromCart, clearCart } = require('../controllers/cartController');

router.post('/', protect, addToCart);
router.get('/', protect, getCart);
router.put('/:id', protect, updateQuantity);
router.delete('/:id', protect, removeFromCart);
router.delete('/', protect, clearCart);

module.exports = router;