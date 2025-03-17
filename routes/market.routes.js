const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');

// Get list of all assets
router.get('/assets', marketController.getAssets);

// Get order book for specific asset
router.get('/orderbook/:asset_code/:asset_issuer', marketController.getOrderBook);

// Get trade history for specific asset
router.get('/trades/:asset_code/:asset_issuer', marketController.getTradeHistory);

// Get price history for specific asset
router.get('/price-history/:asset_code/:asset_issuer', marketController.getPriceHistory);

// Add this to your existing routes
router.post('/trade', marketController.executeTrade);

module.exports = router; 