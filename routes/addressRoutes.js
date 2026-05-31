const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, (req, res) => {
  res.json([
    { street: '123 Arcana Lane, Magic City' }
  ]);
});

module.exports = router;