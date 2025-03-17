const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');

// Add CORS headers middleware for this route
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Routes with sort and filter options
router.get('/top', assetController.getTopAssets); // Default sort by market cap
router.get('/assets', assetController.getAssets);  // With sort parameters
router.get('/:code/:issuer', assetController.getAssetDetails);
router.get('/search/:query', assetController.searchAssets);

module.exports = router; 