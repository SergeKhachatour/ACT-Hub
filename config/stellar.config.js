const stellar = require('stellar-sdk');

const getServer = () => {
    return new stellar.Server('https://horizon-testnet.stellar.org');
};

const getNetwork = () => {
    return process.env.STELLAR_NETWORK === 'MAINNET' 
        ? stellar.Networks.PUBLIC 
        : stellar.Networks.TESTNET;
};

module.exports = {
    getServer,
    getNetwork
}; 