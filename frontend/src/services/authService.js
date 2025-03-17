const API_URL = process.env.REACT_APP_API_URL;

export const getNonce = async (publicKey) => {
    try {
        const response = await fetch(`${API_URL}/api/auth/nonce/${publicKey}`);
        if (!response.ok) {
            throw new Error('Failed to get nonce');
        }
        return await response.json();
    } catch (error) {
        console.error('Error getting nonce:', error);
        throw error;
    }
};

export const verifySignature = async (publicKey, signature) => {
    try {
        const response = await fetch(`${API_URL}/api/auth/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ publicKey, signature })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Authentication failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Error verifying signature:', error);
        throw error;
    }
}; 