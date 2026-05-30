const express = require('express');
const router = express.Router();
const { createProduct, getProductById, getAllProducts } = require('../controllers/productController');

// POST /api/products - Create a product
router.post('/', createProduct);

// GET /api/products - Fetch all products
router.get('/', getAllProducts);

// ✅ NEW: GET /api/products/:id - Fetch a product by ID
router.get('/:id', getProductById);

module.exports = router;
