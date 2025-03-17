const stellar = require('stellar-sdk');
const { getServer, getNetwork } = require('../config/stellar.config');

// Get all liquidity pools
const getPools = async (req, res) => {
    try {
        const server = getServer();
        const pools = await server.liquidityPools().limit(10).call();
        
        res.json({
            pools: pools.records.map(pool => ({
                id: pool.id,
                reserves: pool.reserves,
                total_shares: pool.total_shares,
                total_trustlines: pool.total_trustlines
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get specific pool details
const getPoolDetails = async (req, res) => {
    try {
        const { poolId } = req.params;
        const server = getServer();
        
        const pool = await server.liquidityPools()
            .liquidityPoolId(poolId)
            .call();

        res.json({
            id: pool.id,
            reserves: pool.reserves,
            total_shares: pool.total_shares,
            total_trustlines: pool.total_trustlines
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getPools,
    getPoolDetails
}; 