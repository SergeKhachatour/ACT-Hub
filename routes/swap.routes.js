const express = require('express');
const router = express.Router();
const swapController = require('../controllers/swap.controller');

// Swap routes
router.post('/execute', swapController.executeSwap);
router.get('/estimate/:sourceAsset/:destAsset/:amount', swapController.estimateSwap);
router.get('/price/:sourceAsset/:destAsset', swapController.getPrice);

module.exports = router; 