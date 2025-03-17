const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3333/api';
const HORIZON_URL = 'https://horizon.stellar.org';

export const getAssets = async () => {
    try {
        // Use our backend API as a proxy to fetch data
        const response = await fetch(`${API_URL}/assets/top`);
        if (!response.ok) {
            throw new Error('Failed to fetch assets');
        }
        const data = await response.json();
        return data.map(asset => ({
            code: asset.code,
            issuer: asset.issuer || 'native',
            type: asset.type === 'native' ? 'Native' : 'Asset',
            price: asset.price || 0,
            change_24h: asset.change_24h || 0,
            volume_24h: asset.volume_24h || 0,
            market_cap: asset.market_cap || 0,
            icon: `https://stellar.expert/img/assets/${asset.code}.png`
        }));
    } catch (error) {
        console.error('Asset service error:', error);
        throw error;
    }
};

export const getAssetDetails = async (code, issuer) => {
    const response = await fetch(`${API_URL}/assets/${code}/${issuer}`);
    if (!response.ok) {
        throw new Error('Failed to fetch asset details');
    }
    return response.json();
};

export const searchAssets = async (query) => {
    const response = await fetch(`${API_URL}/assets/search/${query}`);
    if (!response.ok) {
        throw new Error('Failed to search assets');
    }
    return response.json();
};

// Remove WebSocket subscription as it's not reliable with Horizon
export const subscribeToAssetUpdates = (callback) => {
    // Instead of WebSocket, use polling every 30 seconds
    const intervalId = setInterval(async () => {
        try {
            const assets = await getAssets();
            callback({ type: 'assets_update', data: assets });
        } catch (error) {
            console.error('Asset update error:', error);
        }
    }, 30000);

    return () => clearInterval(intervalId);
}; 