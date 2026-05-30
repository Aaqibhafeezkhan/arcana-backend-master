const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  res.json(cart || { user: req.user._id, items: [] });
};

const addToCart = async (req, res) => {
  const { productId, quantity, size } = req.body;
  if (!size) return res.status(400).json({ message: 'Product size is required' });

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const itemIndex = cart.items.findIndex(item =>
    item.product.equals(productId) && item.size === size
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity, price: product.price, size });
  }

  await cart.save();
  res.json(cart);
};

const updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  const item = cart.items.find(i => i.product.equals(productId));
  if (!item) return res.status(404).json({ message: 'Item not found in cart' });

  item.quantity = quantity;
  await cart.save();
  res.json(cart);
};

const removeCartItem = async (req, res) => {
  const itemId = req.params.id;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  const index = cart.items.findIndex(item => item._id.toString() === itemId);
  if (index === -1) return res.status(404).json({ message: 'Item not found in cart' });

  cart.items.splice(index, 1);
  await cart.save();

  res.json({ message: 'Item removed from cart', cart });
};

const clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.json({ message: 'Cart cleared' });
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
