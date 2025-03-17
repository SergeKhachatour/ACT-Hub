const API_URL = process.env.REACT_APP_API_URL;

export const createAlert = async (alertData) => {
    try {
        const response = await fetch(`${API_URL}/market/alerts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(alertData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create alert');
        }

        return await response.json();
    } catch (error) {
        console.error('Alert service error:', error);
        throw error;
    }
};

export const getAlerts = async (assetCode, assetIssuer) => {
    try {
        const params = new URLSearchParams();
        if (assetCode) params.append('assetCode', assetCode);
        if (assetIssuer) params.append('assetIssuer', assetIssuer);

        const response = await fetch(`${API_URL}/market/alerts?${params}`);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch alerts');
        }

        return await response.json();
    } catch (error) {
        console.error('Alert service error:', error);
        throw error;
    }
};

export const deleteAlert = async (alertId) => {
    try {
        const response = await fetch(`${API_URL}/market/alerts/${alertId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete alert');
        }

        return await response.json();
    } catch (error) {
        console.error('Alert service error:', error);
        throw error;
    }
}; 