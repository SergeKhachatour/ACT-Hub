import { isConnected, getPublicKey, connect } from '@stellar/freighter-api';

export const checkFreighterConnection = async () => {
    try {
        const connected = await isConnected();
        console.log('Freighter connection status:', connected);
        return connected;
    } catch (error) {
        console.error('Error checking Freighter connection:', error);
        return false;
    }
};

export const getFreighterPublicKey = async () => {
    try {
        const publicKey = await getPublicKey();
        console.log('Got Freighter public key:', publicKey);
        return publicKey;
    } catch (error) {
        console.error('Error getting Freighter public key:', error);
        throw new Error('Please make sure Freighter is installed and unlocked');
    }
};

export const connectFreighter = async () => {
    try {
        // First check if already connected
        let connected = await isConnected();
        console.log('Initial connection status:', connected);

        if (!connected) {
            // Try to connect
            await connect();
            connected = await isConnected();
            console.log('Connection status after connect:', connected);
        }

        if (!connected) {
            throw new Error('Failed to connect. Please unlock your Freighter wallet and try again.');
        }

        const publicKey = await getPublicKey();
        console.log('Successfully connected with public key:', publicKey);
        return publicKey;
    } catch (error) {
        console.error('Freighter connection error:', error);
        if (error.message.includes('User rejected')) {
            throw new Error('Connection rejected. Please approve the connection in Freighter.');
        }
        throw error;
    }
}; 