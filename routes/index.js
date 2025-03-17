const express = require('express');
const router = express.Router();
const assetRoutes = require('./assetRoutes');
const poolRoutes = require('./poolRoutes');

router.use('/assets', assetRoutes);
router.use('/pools', poolRoutes);

module.exports = router; 