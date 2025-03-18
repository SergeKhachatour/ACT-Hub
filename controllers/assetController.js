const fetch = require('node-fetch');
const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server('https://horizon.stellar.org');
const { Networks } = StellarSdk;

// Set up the network correctly
const stellar = new StellarSdk.Server('https://horizon.stellar.org', {
    networkPassphrase: Networks.PUBLIC
});

const HORIZON_URL = 'https://horizon.stellar.org';
const NodeCache = require('node-cache');
const assetCache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

// Retry configuration
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds
const BATCH_SIZE = 3; // Reduce batch size
const BATCH_DELAY = 1000; // 1 second between batches

// Helper function to add retry logic with rate limit handling
const fetchWithRetry = async (url, attempts = RETRY_ATTEMPTS) => {
    for (let i = 0; i < attempts; i++) {
        try {
            const response = await fetch(url, { 
                timeout: 8000, // 8 second timeout
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Stellar-Trading-App'
                }
            });

            // Handle rate limiting
            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After') || 5;
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                continue;
            }

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            if (i === attempts - 1) throw error;
            // Exponential backoff with jitter
            const delay = RETRY_DELAY * Math.pow(2, i) * (0.9 + Math.random() * 0.2);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// Update the stablecoin and fiat asset mapping
const STABLECOIN_ASSETS = {
    'USDC': {
        issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
        type: 'Stablecoin',
        peg: 'USD'
    },
    'USDT': {
        issuer: 'GCQTGZQQ5G4PTM2GL7CDIFKUBIPEC52BROAQIAPW53XBRJVN6ZJVTG6V',
        type: 'Stablecoin',
        peg: 'USD'
    },
    'EURT': {
        issuer: 'GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S',
        type: 'Stablecoin',
        peg: 'EUR'
    },
    'BRL': {
        issuer: 'GDVKY2GU2DRXWTBEYJJWSFXIGBZV6AZNBVVSUHEPZI54LIS6BA7DVVSP',
        type: 'Fiat',
        peg: 'BRL'
    }
    // Add more known stablecoins and fiat tokens
};

const getAssetType = (asset) => {
    if (asset.asset_type === 'native') return 'Native';
    
    const assetKey = `${asset.asset_code}:${asset.asset_issuer}`;
    const knownAsset = STABLECOIN_ASSETS[asset.asset_code];
    
    if (knownAsset && knownAsset.issuer === asset.asset_issuer) {
        return knownAsset.type;
    }

    // Check for common stablecoin patterns
    if (asset.asset_code.includes('USD') || 
        asset.asset_code.startsWith('USD') || 
        asset.asset_code.endsWith('USD')) {
        return 'Stablecoin';
    }

    // Check for fiat currencies
    if (['EUR', 'GBP', 'JPY', 'CNY', 'BRL', 'AUD'].includes(asset.asset_code)) {
        return 'Fiat';
    }

    // Check for wrapped tokens
    if (asset.asset_code.startsWith('y') || asset.asset_code.startsWith('w')) {
        return 'Wrapped';
    }

    return 'Crypto';
};

const getAssetImage = (asset) => {
    const code = asset.asset_code?.toLowerCase();
    const issuer = asset.asset_issuer;

    // Check for specific assets by code and issuer
    if (code === 'usdc' && issuer === 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN') {
        return 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png';
    }
    if (code === 'yxlm' && issuer === 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55') {
        return 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png';
    }
    if (code === 'ybtc' && issuer === 'GDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55') {
        return 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png';
    }
    if (code === 'yeth' && issuer === 'GDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55') {
        return 'https://assets.coingecko.com/coins/images/279/small/ethereum.png';
    }
    if (code === 'aqua' && issuer === 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA') {
        return 'https://assets.coingecko.com/coins/images/24628/small/aqua.png';
    }
    if (code === 'lsp' && issuer === 'GAB7STHVD5BDH3EEYXPI3OM7PCS4V443PYB5FNT6CFGJVPDLMKDM24WK') {
        return 'https://assets.coingecko.com/coins/images/28298/small/lumenswap.png';
    }
    if (code === 'act' && issuer === 'GAHHULDPDVGB5WS5PH7BCGLJ7ZHECDBIIMKB62UPVDUOCHNFL7HX3FS7') {
        return 'https://act.network/assets/img/act-logo.png';
    }

    // Special case for XLM
    if (code === 'xlm' || asset.asset_code === 'XLM' || !code) {
        return 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png';
    }

    // Fallback to generic icon
    return 'https://assets.coingecko.com/coins/images/12817/small/generic-token.png';
};

const formatIssuer = (issuer) => {
    if (!issuer || issuer === 'Native') return '';
    return issuer;
};

// Update the MAJOR_CRYPTOS object to include Stellar-issued assets
const MAJOR_CRYPTOS = {
    // Major cryptocurrencies
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'USDT': 'tether',
    'BNB': 'binancecoin',
    'MATIC': 'matic-network',
    'DOT': 'polkadot',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
    'AAVE': 'aave',
    'DOGE': 'dogecoin',
    // Stellar-issued assets
    'yXLM': { issuer: 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55' },
    'yBTC': { issuer: 'GDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55' },
    'yETH': { issuer: 'GDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55' },
    'LSP': { issuer: 'GAB7STHVD5BDH3EEYXPI3OM7PCS4V443PYB5FNT6CFGJVPDLMKDM24WK' },
    'AQUA': { issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA' },
    'RIO': { issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA' }
};

const FIAT_TOKENS = {
    'USDC': true,
    'USDT': true,
    'EURT': true,
    'NGNT': true,
    'BRLT': true,
    'ARST': true,
    'JPYT': true,
    'GBP': true,
    'EUR': true,
    'USD': true,
};

// Add at the top with other constants
const LOBSTR_ASSETS = {
    // Stablecoins
    'USDC': { issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN', type: 'Stablecoin' },
    'EURT': { issuer: 'GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S', type: 'Stablecoin' },
    // Wrapped Assets
    'yXLM': { issuer: 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55', type: 'Wrapped' },
    'yBTC': { issuer: 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55', type: 'Wrapped' },
    'yETH': { issuer: 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55', type: 'Wrapped' },
    // Stellar Ecosystem
    'AQUA': { issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA', type: 'Crypto' },
    'LSP': { issuer: 'GAB7STHVD5BDH3EEYXPI3OM7PCS4V443PYB5FNT6CFGJVPDLMKDM24WK', type: 'Crypto' },
    'RIO': { issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA', type: 'Crypto' },
    'SHX': { issuer: 'GDSTRSHXHGJ7ZIVRBXEYE5Q74XUVCUSEKEBR7UCHEUUEK72N7I7KJ6JH', type: 'Crypto' },
    'DOGET': { issuer: 'GDOEVDDBU6OBWKL7VHDAOKD77UP4DKHQYKOKJJT5PR3WRDBTX35HUEUX', type: 'Crypto' },
    'ACT': { issuer: 'GAHHULDPDVGB5WS5PH7BCGLJ7ZHECDBIIMKB62UPVDUOCHNFL7HX3FS7', type: 'Crypto' }
};

// Add real-time price fetching
const getCryptoPrice = async (symbol) => {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`);
        const data = await response.json();
        return data[symbol]?.usd || 0;
    } catch (error) {
        console.error(`Error fetching ${symbol} price:`, error);
        return 0;
    }
};

// Update getAssetPrice function
const getAssetPrice = async (code, issuer) => {
    try {
        // Stablecoins
        if (code === 'USDC' || code === 'EURT') return 1;
        if (code === 'XLM') return xlmPrice;

        // Real-time crypto prices
        if (code === 'yBTC') {
            const btcPrice = await getCryptoPrice('bitcoin');
            return btcPrice || 43000; // Fallback price
        }
        if (code === 'yETH') {
            const ethPrice = await getCryptoPrice('ethereum');
            return ethPrice || 2200; // Fallback price
        }

        // Get price from USDC orderbook for other assets
        const orderbook = await server.orderbook(
            new StellarSdk.Asset(code, issuer),
            new StellarSdk.Asset('USDC', 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN')
        )
        .limit(1)
        .call();

        return parseFloat(orderbook.bids[0]?.price || 0);
    } catch (error) {
        console.error(`Error getting price for ${code}:`, error);
        return 0;
    }
};

// Update getTopAssets function
const getTopAssets = async (req, res) => {
    try {
        console.log('Fetching top assets from Horizon...');

        // Get XLM price first
        const xlmPrice = await server
            .orderbook(
                new StellarSdk.Asset.native(),
                new StellarSdk.Asset('USDC', 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN')
            )
            .limit(1)
            .call()
            .then(response => parseFloat(response.bids[0]?.price || 0.15));
        console.log('XLM price:', xlmPrice);

        // Process all Lobstr curated assets
        const processedAssets = await Promise.all(
            Object.entries(LOBSTR_ASSETS).map(async ([code, info]) => {
                try {
                    console.log(`Processing ${code}...`);
                    
                    const assetData = await server.assets()
                        .forCode(code)
                        .forIssuer(info.issuer)
                        .call()
                        .then(response => response.records[0]);

                    if (!assetData) {
                        console.log(`No data found for ${code}`);
                        return null;
                    }

                    const price = await getAssetPrice(code, info.issuer);
                    const supply = parseFloat(assetData.amount || 0);
                    const marketCap = supply * price;

                    return {
                        code,
                        issuer: info.issuer,
                        type: info.type,
                        supply,
                        holders: parseInt(assetData.num_accounts || 0),
                        price,
                        market_cap: marketCap,
                        domain: assetData.home_domain || '',
                        image_url: getAssetImage({
                            asset_code: code,
                            asset_issuer: info.issuer,
                            asset_type: assetData.asset_type
                        })
                    };
                } catch (error) {
                    console.error(`Error processing ${code}:`, error);
                    return null;
                }
            })
        );

        // Get XLM stats and add as first asset
        const xlmStats = await server.ledgers()
            .order('desc')
            .limit(1)
            .call()
            .then(response => response.records[0]);

        const validAssets = [
            {
                code: 'XLM',
                issuer: 'native',
                type: 'Native',
                supply: parseFloat(xlmStats.total_coins),
                holders: parseInt(xlmStats.account_count),
                price: xlmPrice,
                market_cap: xlmPrice * parseFloat(xlmStats.total_coins),
                domain: 'stellar.org',
                image_url: getAssetImage({
                    asset_code: 'XLM',
                    asset_issuer: 'native',
                    asset_type: 'native'
                })
            },
            ...processedAssets.filter(Boolean)
        ].sort((a, b) => b.market_cap - a.market_cap);

        console.log(`Returning ${validAssets.length} assets`);
        res.json(validAssets);

    } catch (error) {
        console.error('Error fetching top assets:', error);
        res.status(500).json({ 
            error: 'Failed to fetch assets',
            details: error.message
        });
    }
};

const curatedAssets = [
    {
        code: 'XLM',
        issuer: 'native',
        name: 'Stellar Lumens',
        type: 'native',
        image: 'https://stellar.expert/img/assets/native.svg',
        holders: 0
    },
    {
        code: 'USDC',
        issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
        name: 'USD Coin',
        type: 'stablecoin',
        image: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
        holders: 0
    },
    {
        code: 'AQUA',
        issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
        name: 'Aquarius',
        type: 'curated',
        image: 'https://aqua.network/assets/aqua-logo.png',
        holders: 0
    },
    {
        code: 'LSP',
        issuer: 'GAB7STHVD5BDH3EEYXPI3OM7PCS4V443PYB5FNT6CFGJVPDLMKDM24WK',
        name: 'LOBSTR Utility Token',
        type: 'curated',
        image: 'https://lobstr.co/assets/logos/lsp.png',
        holders: 0
    },
    {
        code: 'ACT',
        issuer: 'GAHHULDPDVGB5WS5PH7BCGLJ7ZHECDBIIMKB62UPVDUOCHNFL7HX3FS7',
        name: 'ACT Token',
        type: 'curated',
        image: 'https://act.network/assets/act-logo.png',
        holders: 0
    },
    {
        code: 'BRAINFROG',
        issuer: 'GCB2CE4PWFOECXWHAPAANRN34BS2ECGUKXFO655MEB4X674QXKI7QXHR',
        name: 'BRAINFROG',
        type: 'curated',
        image: 'https://lobstr.co/assets/logos/brainfrog.png',
        holders: 0
    },
    {
        code: 'yXLM',
        issuer: 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55',
        name: 'Wrapped Stellar',
        type: 'wrapped',
        image: 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png',
        holders: 0
    },
    {
        code: 'yBTC',
        issuer: 'GDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55',
        name: 'Wrapped Bitcoin',
        type: 'wrapped',
        image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
        holders: 0
    },
    {
        code: 'yETH',
        issuer: 'GDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55',
        name: 'Wrapped Ethereum',
        type: 'wrapped',
        image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
        holders: 0
    },
    {
        code: 'EURT',
        issuer: 'GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S',
        name: 'Euro Token',
        type: 'stablecoin',
        image: 'https://assets.coingecko.com/coins/images/17241/small/euro-token.png',
        holders: 0
    }
];

const getLobstrAssetData = async (code, issuer) => {
    try {
        const response = await fetch(
            `https://api.stellar.expert/explorer/public/asset/${code}-${issuer}`
        );
        const data = await response.json();
        return {
            holders: data.statistics?.accounts?.total || 0,
            supply: parseFloat(data.asset?.supply || 0),
            price: data.price?.usd || 0,
            market_cap: data.price?.usd * parseFloat(data.asset?.supply || 0)
        };
    } catch (error) {
        console.error(`Error fetching ${code} data from Stellar Expert:`, error);
        return null;
    }
};

const getAssets = async (req, res) => {
    try {
        // Check cache first
        const cachedAssets = assetCache.get('assets');
        if (cachedAssets) {
            return res.json(cachedAssets);
        }

        // Get XLM price first for reference
        const xlmPrice = await stellar.orderbook(
            new StellarSdk.Asset.native(),
            new StellarSdk.Asset('USDC', 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN')
        )
        .limit(1)
        .call()
        .then(response => parseFloat(response.bids[0]?.price || 0));

        // Fetch data for all assets in parallel
        const assetsWithDetails = await Promise.all(
            curatedAssets.map(async (asset) => {
                try {
                    let assetDetails = { ...asset };

                    if (asset.issuer === 'native') {
                        // For XLM, get account count from latest ledger
                        const ledger = await stellar.ledgers()
                            .order('desc')
                            .limit(1)
                            .call()
                            .then(response => response.records[0]);
                        
                        assetDetails.holders = parseInt(ledger.account_count);
                        assetDetails.price = xlmPrice;
                        assetDetails.supply = parseFloat(ledger.total_coins);
                        assetDetails.market_cap = xlmPrice * parseFloat(ledger.total_coins);
                    } else {
                        // For other assets, get stats from assets endpoint
                        const assetStats = await stellar.assets()
                            .forCode(asset.code)
                            .forIssuer(asset.issuer)
                            .call()
                            .then(response => response.records[0]);

                        assetDetails.holders = parseInt(assetStats?.num_accounts || 0);
                        assetDetails.supply = parseFloat(assetStats?.amount || 0);

                        // Get price from USDC orderbook
                        if (asset.code === 'USDC' || asset.code === 'EURT') {
                            assetDetails.price = 1; // Stablecoins
                        } else {
                            const orderbook = await stellar.orderbook(
                                new StellarSdk.Asset(asset.code, asset.issuer),
                                new StellarSdk.Asset('USDC', 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN')
                            )
                            .limit(1)
                            .call();

                            assetDetails.price = parseFloat(orderbook.bids[0]?.price || 0);
                        }

                        assetDetails.market_cap = assetDetails.price * assetDetails.supply;
                    }

                    // Get liquidity pools count
                    const poolsResponse = await stellar.liquidityPools()
                        .forAssets([new StellarSdk.Asset(asset.code, asset.issuer === 'native' ? null : asset.issuer)])
                        .limit(200)
                        .call();

                    assetDetails.pool_count = poolsResponse.records.length;

                    return assetDetails;
                } catch (error) {
                    console.error(`Error fetching details for ${asset.code}:`, error);
                    return { 
                        ...asset, 
                        pool_count: 0,
                        market_cap: 0,
                        holders: 0,
                        supply: 0
                    };
                }
            })
        );

        // Cache the results
        assetCache.set('assets', assetsWithDetails);
        res.json(assetsWithDetails);
    } catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).json({ error: 'Failed to fetch assets' });
    }
};

const getAssetDetails = async (req, res) => {
    try {
        const { code, issuer } = req.params;
        const asset = new StellarSdk.Asset(code, issuer);
        // Implement asset details fetching logic here
        res.json({ code, issuer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const searchAssets = async (req, res) => {
    try {
        const { query } = req.params;
        
        // Convert LOBSTR_ASSETS object to searchable array
        const searchResults = Object.entries(LOBSTR_ASSETS)
            .filter(([code]) => code.toLowerCase().includes(query.toLowerCase()))
            .map(([code, info]) => ({
                code,
                issuer: info.issuer,
                type: info.type,
                image_url: getAssetImage({
                    asset_code: code,
                    asset_issuer: info.issuer
                })
            }));

        // Add XLM if query matches
        if ('xlm'.includes(query.toLowerCase())) {
            searchResults.unshift({
                code: 'XLM',
                issuer: 'native',
                type: 'Native',
                image_url: getAssetImage({
                    asset_code: 'XLM',
                    asset_issuer: 'native',
                    asset_type: 'native'
                })
            });
        }

        res.json(searchResults);
    } catch (error) {
        console.error('Error searching assets:', error);
        res.status(500).json({ 
            error: 'Failed to search assets',
            details: error.message
        });
    }
};

module.exports = {
    getTopAssets,
    getAssets,
    getAssetDetails,
    searchAssets
}; 