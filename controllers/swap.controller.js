const StellarSdk = require('stellar-sdk');
const { getServer } = require('../config/stellar.config');

const server = getServer();

exports.executeSwap = async (req, res) => {
    try {
        const { sourceSecret, sourceAsset, destAsset, amount } = req.body;
        
        const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecret);
        const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

        const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET
        })
        .addOperation(StellarSdk.Operation.pathPaymentStrictSend({
            sendAsset: new StellarSdk.Asset(sourceAsset.code, sourceAsset.issuer),
            sendAmount: amount.toString(),
            destination: sourceKeypair.publicKey(),
            destAsset: new StellarSdk.Asset(destAsset.code, destAsset.issuer),
            destMin: '0', // Calculate this based on slippage
        }))
        .setTimeout(30)
        .build();

        transaction.sign(sourceKeypair);
        const result = await server.submitTransaction(transaction);

        res.json({ success: true, transaction: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.estimateSwap = async (req, res) => {
    try {
        const { sourceAsset, destAsset, amount } = req.params;
        
        // Get pool details and calculate estimated output
        const pool = await server.liquidityPools()
            .forAssets(
                new StellarSdk.Asset(sourceAsset.code, sourceAsset.issuer),
                new StellarSdk.Asset(destAsset.code, destAsset.issuer)
            )
            .call();

        // Calculate estimated amount based on pool reserves
        // This is a simplified calculation - you should implement proper AMM math
        const estimatedAmount = calculateEstimatedOutput(pool, amount);

        res.json({ estimatedAmount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPrice = async (req, res) => {
    try {
        const { sourceAsset, destAsset } = req.params;
        
        // Fetch current pool price
        const pool = await server.liquidityPools()
            .forAssets(
                new StellarSdk.Asset(sourceAsset.code, sourceAsset.issuer),
                new StellarSdk.Asset(destAsset.code, destAsset.issuer)
            )
            .call();

        const price = calculatePrice(pool);
        res.json({ price });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 