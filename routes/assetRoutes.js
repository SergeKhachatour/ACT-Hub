const express = require('express');
const router = express.Router();
const { 
    getTopAssets, 
    getAssets, 
    getAssetDetails, 
    searchAssets 
} = require('../controllers/assetController');

// Add CORS headers middleware for this route
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Routes with sort and filter options
router.get('/', getAssets);
router.get('/top', getTopAssets);
router.get('/search/:query', searchAssets);
router.get('/:code/:issuer', getAssetDetails);

module.exports = router; 