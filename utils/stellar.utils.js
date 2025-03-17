const StellarSdk = require('stellar-sdk');

exports.calculateEstimatedOutput = (pool, inputAmount) => {
    const reserveA = parseFloat(pool.reserves[0].amount);
    const reserveB = parseFloat(pool.reserves[1].amount);
    const input = parseFloat(inputAmount);
    
    // Constant product formula: x * y = k
    const k = reserveA * reserveB;
    const newReserveA = reserveA + input;
    const newReserveB = k / newReserveA;
    
    return (reserveB - newReserveB).toString();
};

exports.calculatePrice = (pool) => {
    const reserveA = parseFloat(pool.reserves[0].amount);
    const reserveB = parseFloat(pool.reserves[1].amount);
    
    return (reserveB / reserveA).toString();
};

exports.validateAsset = (asset) => {
    if (asset.code === 'XLM') {
        return StellarSdk.Asset.native();
    }
    return new StellarSdk.Asset(asset.code, asset.issuer);
}; 