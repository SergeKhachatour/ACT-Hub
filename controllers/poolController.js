const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server('https://horizon.stellar.org');

// Add retry helper function
const retryOperation = async (operation, maxAttempts = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxAttempts) throw error;
            console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            // Exponential backoff
            delay *= 2;
        }
    }
};

const getLiquidityPools = async (req, res) => {
    try {
        const { asset_code, asset_issuer } = req.query;
        console.log(`Fetching pools for ${asset_code} from ${asset_issuer}`);

        // Create the asset object
        const targetAsset = asset_issuer === 'native' 
            ? StellarSdk.Asset.native()
            : new StellarSdk.Asset(asset_code, asset_issuer);

        // Fetch liquidity pools with retry
        const poolsResponse = await retryOperation(async () => {
            return await server.liquidityPools()
                .forAssets([targetAsset])
                .limit(100)
                .call();
        });

        // Process pool data with retry for each pool
        const pools = await Promise.all(poolsResponse.records.map(async pool => {
            try {
                const reserves = pool.reserves.map(reserve => ({
                    asset: reserve.asset === 'native' ? 'XLM' : reserve.asset.split(':')[0],
                    amount: parseFloat(reserve.amount),
                    issuer: reserve.asset === 'native' ? 'native' : reserve.asset.split(':')[1]
                }));

                // Get 24h volume from trades with retry
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                const trades = await retryOperation(async () => {
                    return await server.trades()
                        .forLiquidityPool(pool.id)
                        .cursor('now')
                        .limit(200)
                        .order('desc')
                        .call();
                });

                // Calculate volume and latest price
                let volume24h = 0;
                let latestPrice = 0;
                
                trades.records.forEach(trade => {
                    const tradeDate = new Date(trade.timestamp);
                    if (tradeDate > oneDayAgo) {
                        // Convert amounts to numbers and add to volume
                        const baseAmount = parseFloat(trade.base_amount);
                        const counterAmount = parseFloat(trade.counter_amount);
                        volume24h += baseAmount;
                        
                        // Update latest price
                        if (!latestPrice) {
                            latestPrice = parseFloat(trade.price);
                        }
                    }
                });

                return {
                    id: pool.id,
                    type: pool.type,
                    fee_bp: pool.fee_bp,
                    total_trustlines: pool.total_trustlines,
                    total_shares: pool.total_shares,
                    reserves,
                    total_value: reserves.reduce((sum, reserve) => sum + parseFloat(reserve.amount), 0),
                    volume_24h: volume24h,
                    latest_price: latestPrice,
                    apy: calculateAPY(volume24h, pool.fee_bp, reserves[0].amount),
                    pair: `${reserves[0].asset}/${reserves[1].asset}`
                };
            } catch (error) {
                console.error(`Error processing pool ${pool.id}:`, error);
                return null;
            }
        }));

        // Filter out failed pools
        const validPools = pools.filter(Boolean);
        console.log(`Found ${validPools.length} liquidity pools`);
        res.json(validPools);

    } catch (error) {
        console.error('Error fetching liquidity pools:', error);
        res.status(500).json({ 
            error: 'Failed to fetch liquidity pools',
            details: error.message
        });
    }
};

// Helper function to calculate APY
const calculateAPY = (volume24h, feeBP, reserveAmount) => {
    if (!volume24h || !reserveAmount) return 0;
    
    const dailyFees = (volume24h * feeBP) / 10000; // fee_bp is in basis points
    const yearlyFees = dailyFees * 365;
    return (yearlyFees / reserveAmount) * 100; // Return as percentage
};

const getPoolDetails = async (req, res) => {
    try {
        const { pool_id } = req.params;
        console.log(`Fetching details for pool ${pool_id}`);

        const pool = await server.liquidityPools()
            .liquidityPoolId(pool_id)
            .call();

        // Get recent trades
        const trades = await server.trades()
            .forLiquidityPool(pool_id)
            .limit(10)
            .order('desc')
            .call();

        const poolData = {
            ...pool,
            reserves: pool.reserves.map(reserve => ({
                asset: reserve.asset === 'native' ? 'XLM' : reserve.asset.split(':')[0],
                amount: parseFloat(reserve.amount),
                issuer: reserve.asset === 'native' ? 'native' : reserve.asset.split(':')[1]
            })),
            recent_trades: trades.records.map(trade => ({
                id: trade.id,
                timestamp: trade.timestamp,
                base_amount: trade.base_amount,
                counter_amount: trade.counter_amount,
                price: trade.price
            }))
        };

        res.json(poolData);

    } catch (error) {
        console.error('Error fetching pool details:', error);
        res.status(500).json({ 
            error: 'Failed to fetch pool details',
            details: error.message
        });
    }
};

const getPoolTrades = async (req, res) => {
    try {
        const { pool_id } = req.params;
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        try {
            const trades = await retryOperation(async () => {
                return await server.trades()
                    .forLiquidityPool(pool_id)
                    .cursor('now')
                    .limit(200)
                    .order('desc')
                    .call();
            });

            const processedTrades = trades.records
                .filter(trade => new Date(trade.timestamp) > oneDayAgo)
                .map(trade => ({
                    id: trade.id,
                    timestamp: trade.timestamp,
                    price: parseFloat(trade.price),
                    base_amount: parseFloat(trade.base_amount),
                    counter_amount: parseFloat(trade.counter_amount),
                    // Add base and counter asset info
                    base_asset: trade.base_asset_code || 'XLM',
                    counter_asset: trade.counter_asset_code || 'XLM'
                }))
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Sort by timestamp

            res.json(processedTrades);
        } catch (error) {
            if (error.response?.status === 404) {
                // Pool not found, return empty array
                res.json([]);
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error fetching pool trades:', error);
        res.status(500).json({ 
            error: 'Failed to fetch pool trades',
            details: error.message
        });
    }
};

module.exports = {
    getLiquidityPools,
    getPoolDetails,
    getPoolTrades
}; 