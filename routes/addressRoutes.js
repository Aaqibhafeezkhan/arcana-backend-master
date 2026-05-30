const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, (req, res) => {
  res.json(req.user.addresses || []);
});

module.exports = router;