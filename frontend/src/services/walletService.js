const API_URL = process.env.REACT_APP_API_URL;

export const createWallet = async () => {
    try {
        const response = await fetch(`${API_URL}/api/wallet/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to create wallet');
        }

        return await response.json();
    } catch (error) {
        console.error('Creation error:', error);
        throw new Error('Failed to create wallet');
    }
};

export const getBalance = async (publicKey) => {
    try {
        const response = await fetch(`${API_URL}/api/wallet/balance/${publicKey}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch balance');
        }

        return await response.json();
    } catch (error) {
        console.error('Balance check error:', error);
        throw error;
    }
};

export const fundWallet = async (destinationKey) => {
    try {
        const response = await fetch(`${API_URL}/api/wallet/fund`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ destinationKey })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fund wallet');
        }

        const result = await response.json();
        console.log('Funding result:', result);
        return result;
    } catch (error) {
        console.error('Funding error:', error);
        throw error;
    }
}; 