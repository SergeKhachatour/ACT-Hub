const stellar = require('stellar-sdk');
const { getServer } = require('../config/stellar.config');
const StellarSdk = require('stellar-sdk');
const fetch = require('node-fetch');

// Create a new wallet
const createWallet = async (req, res) => {
    try {
        const pair = stellar.Keypair.random();
        
        res.json({
            publicKey: pair.publicKey(),
            secretKey: pair.secret()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Configure Stellar SDK for testnet
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

// Get wallet balance
const getBalance = async (req, res) => {
    try {
        const { publicKey } = req.params;
        
        // Load account details
        const account = await server.loadAccount(publicKey);
        
        // Format balances
        const balances = account.balances.map(balance => ({
            asset: balance.asset_type === 'native' ? 'XLM' : balance.asset_code,
            balance: balance.balance
        }));

        res.json({ balances });
    } catch (error) {
        console.error('Balance check error:', error);
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
};

const createFundingTransaction = async (req, res) => {
    try {
        const { destinationKey } = req.body;
        
        if (!destinationKey) {
            return res.status(400).json({ error: 'Destination key is required' });
        }

        console.log('Funding account:', destinationKey);

        // Create test account using Friendbot
        try {
            const friendbotUrl = `https://friendbot.stellar.org?addr=${encodeURIComponent(destinationKey)}`;
            console.log('Friendbot URL:', friendbotUrl);

            const response = await fetch(friendbotUrl);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Friendbot error response:', errorText);
                throw new Error('Failed to fund account with Friendbot');
            }

            const result = await response.json();
            console.log('Funding success:', result);
            
            res.json({ 
                message: 'Account funded successfully',
                transaction: result
            });
        } catch (error) {
            console.error('Friendbot error:', error);
            res.status(500).json({ error: 'Failed to fund account with Friendbot: ' + error.message });
        }
    } catch (error) {
        console.error('Funding error:', error);
        res.status(500).json({ error: 'Failed to create funding transaction: ' + error.message });
    }
};

const submitTransaction = async (req, res) => {
    try {
        const { signedXdr } = req.body;
        const server = getServer();
        
        // Convert XDR back to transaction and submit
        const transaction = stellar.TransactionBuilder.fromXDR(
            signedXdr,
            stellar.Networks.TESTNET
        );
        
        const result = await server.submitTransaction(transaction);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createWallet,
    getBalance,
    createFundingTransaction,
    submitTransaction
}; 