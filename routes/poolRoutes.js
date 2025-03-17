const express = require('express');
const router = express.Router();
const { getLiquidityPools, getPoolDetails, getPoolTrades } = require('../controllers/poolController');

// Get all liquidity pools for an asset
router.get('/', getLiquidityPools);

// Get details for a specific pool
router.get('/:pool_id', getPoolDetails);

// Get pool trades
router.get('/:pool_id/trades', getPoolTrades);

module.exports = router; 