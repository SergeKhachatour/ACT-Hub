const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server('https://horizon.stellar.org');

// Helper function to calculate 24h volume
const calculate24HourVolume = (trades) => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return trades
        .filter(trade => new Date(trade.ledger_close_time) > oneDayAgo)
        .reduce((sum, trade) => sum + parseFloat(trade.base_amount), 0);
};

// Add this helper function at the top
const checkBalance = async (account, asset, amount) => {
    try {
        const balances = account.balances;
        const balance = balances.find(b => {
            if (asset.isNative()) {
                return b.asset_type === 'native';
            }
            return b.asset_code === asset.code && b.asset_issuer === asset.issuer;
        });

        if (!balance) {
            throw new Error('Asset not found in account');
        }

        if (Number(balance.balance) < Number(amount)) {
            throw new Error('Insufficient balance');
        }

        return true;
    } catch (error) {
        throw error;
    }
};

// Get list of all assets with their details
exports.getAssets = async (req, res) => {
    try {
        const { cursor, limit = 20, order = 'desc' } = req.query;
        
        let assetsCall = server.assets()
            .limit(limit)
            .order(order);

        if (cursor) {
            assetsCall = assetsCall.cursor(cursor);
        }

        const assets = await assetsCall.call();
        
        // Enhance assets with additional data
        const enhancedAssets = await Promise.all(
            assets.records.map(async (asset) => {
                try {
                    // Get recent trades for this asset
                    const trades = await server.trades()
                        .forAsset(asset)
                        .limit(200)  // Get enough trades for volume calculation
                        .order('desc')
                        .call();

                    // Get number of trustlines
                    const assetStats = await server.assets()
                        .forCode(asset.asset_code)
                        .forIssuer(asset.asset_issuer)
                        .call();

                    return {
                        asset_code: asset.asset_code,
                        asset_issuer: asset.asset_issuer,
                        asset_type: asset.asset_type,
                        num_accounts: assetStats.records[0]?.num_accounts || 0,
                        volume_24h: calculate24HourVolume(trades.records),
                        last_price: trades.records[0]?.price || 0,
                        trade_count: trades.records.length
                    };
                } catch (error) {
                    console.error(`Error enhancing asset ${asset.asset_code}:`, error);
                    return asset;
                }
            })
        );

        res.json({
            assets: enhancedAssets,
            next: assets.next,
            prev: assets.prev
        });
    } catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).json({ error: 'Failed to fetch assets' });
    }
};

// Get order book for a specific asset
exports.getOrderBook = async (req, res) => {
    try {
        const { asset_code, asset_issuer } = req.params;
        
        const selling = new StellarSdk.Asset(asset_code, asset_issuer);
        const buying = StellarSdk.Asset.native(); // XLM
        
        const orderbook = await server.orderbook(selling, buying)
            .limit(20)
            .call();

        res.json(orderbook);
    } catch (error) {
        console.error('Error fetching orderbook:', error);
        res.status(500).json({ error: 'Failed to fetch orderbook' });
    }
};

// Get trade history for a specific asset
exports.getTradeHistory = async (req, res) => {
    try {
        const { asset_code, asset_issuer } = req.params;
        const { limit = 20, cursor, order = 'desc' } = req.query;

        const asset = new StellarSdk.Asset(asset_code, asset_issuer);
        
        let tradesCall = server.trades()
            .forAsset(asset)
            .limit(limit)
            .order(order);

        if (cursor) {
            tradesCall = tradesCall.cursor(cursor);
        }

        const trades = await tradesCall.call();
        res.json(trades);
    } catch (error) {
        console.error('Error fetching trade history:', error);
        res.status(500).json({ error: 'Failed to fetch trade history' });
    }
};

// Get price chart data
exports.getPriceHistory = async (req, res) => {
    try {
        const { asset_code, asset_issuer } = req.params;
        const { resolution = '1h', from, to } = req.query;
        
        const asset = new StellarSdk.Asset(asset_code, asset_issuer);
        
        // Get trades and aggregate them based on resolution
        const trades = await server.trades()
            .forAsset(asset)
            .limit(200)  // Adjust based on your needs
            .order('asc')
            .call();

        // Process trades into OHLC format
        const ohlcData = processTradesIntoOHLC(trades.records, resolution);
        
        res.json(ohlcData);
    } catch (error) {
        console.error('Error fetching price history:', error);
        res.status(500).json({ error: 'Failed to fetch price history' });
    }
};

// Update the executeTrade function
exports.executeTrade = async (req, res) => {
    try {
        const { orderType, amount, price, assetCode, assetIssuer, publicKey } = req.body;
        
        if (!publicKey) {
            throw new Error('Public key is required');
        }

        const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
        const asset = new StellarSdk.Asset(assetCode, assetIssuer);
        
        // Get account
        const account = await server.loadAccount(publicKey);
        
        // Check balance based on order type
        if (orderType === 'buy') {
            const totalCost = Number(amount) * Number(price);
            await checkBalance(account, StellarSdk.Asset.native(), totalCost);
        } else {
            await checkBalance(account, asset, amount);
        }

        // Add order size limits
        const MIN_ORDER_SIZE = 0.0000001;
        const MAX_ORDER_SIZE = 10000000; // Adjust based on your needs

        if (Number(amount) < MIN_ORDER_SIZE) {
            throw new Error(`Order size too small. Minimum is ${MIN_ORDER_SIZE}`);
        }

        if (Number(amount) > MAX_ORDER_SIZE) {
            throw new Error(`Order size too large. Maximum is ${MAX_ORDER_SIZE}`);
        }

        // Create the transaction
        const operation = orderType === 'buy' 
            ? StellarSdk.Operation.manageBuyOffer({
                selling: StellarSdk.Asset.native(),
                buying: asset,
                buyAmount: amount,
                price: price
            })
            : StellarSdk.Operation.manageSellOffer({
                selling: asset,
                buying: StellarSdk.Asset.native(),
                amount: amount,
                price: price
            });

        const tx = new StellarSdk.TransactionBuilder(account, {
            fee: await server.fetchBaseFee(),
            networkPassphrase: StellarSdk.Networks.TESTNET
        })
        .addOperation(operation)
        .setTimeout(30)
        .build();

        res.json({
            transaction: tx.toXDR(),
            message: 'Trade transaction created successfully'
        });
    } catch (error) {
        console.error('Trade execution error:', error);
        res.status(500).json({ 
            error: 'Failed to execute trade',
            details: error.message
        });
    }
}; 