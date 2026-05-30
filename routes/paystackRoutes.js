const express = require('express');
const router = express.Router();
const { initializePayment, handleWebhook } = require('../controllers/paystackController');

router.post('/initialize', initializePayment);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;