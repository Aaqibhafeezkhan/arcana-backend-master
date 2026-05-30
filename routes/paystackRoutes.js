const express = require('express');
const router = express.Router();
const {
  initializePayment,
  handleWebhook,
} = require('../controllers/paystackController');

router.post('/initialize', initializePayment);
router.post('/webhook', express.json({ verify: (req, res, buf) => { req.rawBody = buf } }), handleWebhook);

module.exports = router;
