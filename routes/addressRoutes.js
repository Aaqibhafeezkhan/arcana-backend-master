const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, (req, res) => {
  res.json([
    { street: '123 Arcana Lane, Magic City' }
  ]);
});

module.exports = router;