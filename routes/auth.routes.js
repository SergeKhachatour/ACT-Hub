const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const StellarSdk = require('stellar-sdk');

// Get nonce for signing
router.get('/nonce/:publicKey', async (req, res) => {
    try {
        let user = await User.findOne({ publicKey: req.params.publicKey });
        
        if (!user) {
            user = new User({ publicKey: req.params.publicKey, nonce: '' });
        }
        
        const nonce = user.generateNonce();
        await user.save();
        
        res.json({ nonce });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify signature and authenticate
router.post('/verify', async (req, res) => {
    try {
        const { publicKey, signature } = req.body;
        const user = await User.findOne({ publicKey });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create the message that was signed
        const message = `Sign this message to authenticate with ACT-Hub: ${user.nonce}`;
        const messageBytes = Buffer.from(message);

        // Verify the signature using Stellar SDK
        const keyPair = StellarSdk.Keypair.fromPublicKey(publicKey);
        const isValid = keyPair.verify(messageBytes, Buffer.from(signature, 'base64'));

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // Generate new nonce for next authentication
        user.generateNonce();
        await user.save();

        const token = user.generateAuthToken();
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 