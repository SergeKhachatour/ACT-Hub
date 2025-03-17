import React, { createContext, useState, useContext, useEffect } from 'react';
import { getNonce, verifySignature } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check for stored token on mount
        const token = localStorage.getItem('token');
        if (token) {
            setUser({ token });
        }
        setLoading(false);
    }, []);

    const login = async () => {
        try {
            setError(null);
            setLoading(true);

            // Get public key from Freighter
            const publicKey = await window.freighter.getPublicKey();
            
            // Get nonce from server
            const { nonce } = await getNonce(publicKey);
            
            // Create message to sign
            const message = `Sign this message to authenticate with ACT-Hub: ${nonce}`;
            
            // Sign message using Freighter
            const signature = await window.freighter.signMessage(message);
            
            // Verify signature with server
            const { token } = await verifySignature(publicKey, signature);
            
            // Store token and update user state
            localStorage.setItem('token', token);
            setUser({ token, publicKey });
            
            return token;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}; 