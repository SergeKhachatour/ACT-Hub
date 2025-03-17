const API_URL = process.env.REACT_APP_API_URL;

export const executeTrade = async (tradeData) => {
    try {
        // Get public key from Freighter or your wallet management
        const publicKey = await window.freighter.getPublicKey();
        
        const response = await fetch(`${API_URL}/api/market/trade`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...tradeData,
                publicKey
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || 'Failed to execute trade');
        }

        return await response.json();
    } catch (error) {
        console.error('Trade execution error:', error);
        throw error;
    }
}; 