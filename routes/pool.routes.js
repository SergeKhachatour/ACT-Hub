const express = require('express');
const router = express.Router();
const poolController = require('../controllers/pool.controller');

// Get all pools
router.get('/', poolController.getPools);

// Get specific pool details
router.get('/:poolId', poolController.getPoolDetails);

module.exports = router; 