const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const StellarSdk = require('stellar-sdk');

// Create a new wallet
router.post('/create', async (req, res) => {
    try {
        // Generate a new keypair
        const pair = StellarSdk.Keypair.random();
        
        const wallet = {
            publicKey: pair.publicKey(),
            secretKey: pair.secret()
        };

        res.json(wallet);
    } catch (error) {
        console.error('Error creating wallet:', error);
        res.status(500).json({ error: 'Failed to create wallet' });
    }
});

// Get wallet balance
router.get('/balance/:publicKey', walletController.getBalance);

// Create a funding transaction
router.post('/fund', walletController.createFundingTransaction);

// Submit a transaction
router.post('/submit', walletController.submitTransaction);

module.exports = router; 