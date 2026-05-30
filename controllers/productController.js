const Product = require('../models/Product');

// @desc    Create a new product
// @route   POST /api/products
// @access  Public or Admin (depending on your auth setup)
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({ message: 'Failed to create product' });
  }
};
// GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find(); // You can also .sort() here if needed
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error });
  }
};
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// You can expand with other controllers like getAllProducts, getProductById, etc.

module.exports = {
  createProduct,
  getProductById,
  getAllProducts
};
