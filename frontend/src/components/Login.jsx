import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as freighterApi from '@stellar/freighter-api';
import './Login.css';

const Login = () => {
    const { login, error } = useAuth();
    const [loading, setLoading] = useState(false);
    const [freighterInstalled, setFreighterInstalled] = useState(false);
    const [freighterConnected, setFreighterConnected] = useState(false);
    const [publicKey, setPublicKey] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkFreighterStatus = async () => {
            try {
                // Check if Freighter is installed
                const isAvailable = await freighterApi.isConnected();
                console.log('Freighter available:', isAvailable);
                setFreighterInstalled(isAvailable);

                if (isAvailable) {
                    try {
                        // Check if already connected
                        const connected = await freighterApi.isAllowed();
                        console.log('Freighter connected:', connected);
                        setFreighterConnected(connected);

                        if (connected) {
                            const key = await freighterApi.getPublicKey();
                            const network = await freighterApi.getNetwork();
                            console.log('Connected to network:', network);
                            console.log('Public key:', key);
                            setPublicKey(key);
                        }
                    } catch (err) {
                        console.log('Connection check error:', err);
                    }
                }
            } catch (error) {
                console.error('Error checking Freighter:', error);
            }
        };

        checkFreighterStatus();
    }, []);

    const handleLogin = async () => {
        // Don't do anything if already connected
        if (freighterConnected) {
            return;
        }

        try {
            setLoading(true);
            console.log('Starting login process...');

            if (!freighterInstalled) {
                throw new Error('Please install Freighter wallet');
            }

            // Request permission if not already connected
            console.log('Requesting Freighter permission...');
            await freighterApi.setAllowed();
            
            const connected = await freighterApi.isAllowed();
            console.log('Permission granted:', connected);
            
            if (!connected) {
                throw new Error('Permission denied by user');
            }
            
            setFreighterConnected(true);
            
            // Get public key after connection
            const key = await freighterApi.getPublicKey();
            setPublicKey(key);

            await login();
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
            alert(error.message || 'Failed to connect to Freighter');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Connect with Freighter</h2>
            
            <div className="debug-info">
                <p>Freighter installed: {String(freighterInstalled)}</p>
                <p>Freighter connected: {String(freighterConnected)}</p>
                {publicKey && <p>Public Key: {publicKey.slice(0, 10)}...{publicKey.slice(-10)}</p>}
            </div>
            
            {!freighterInstalled ? (
                <p className="warning-message">
                    Please install the Freighter wallet extension from{' '}
                    <a 
                        href="https://www.freighter.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        freighter.app
                    </a>
                </p>
            ) : !freighterConnected ? (
                <p className="info-message">
                    Click below to connect your Freighter wallet
                </p>
            ) : (
                <p className="success-message">
                    Freighter wallet connected!
                </p>
            )}

            <button 
                onClick={handleLogin}
                disabled={loading || !freighterInstalled || freighterConnected}
                className={`login-button ${freighterConnected ? 'connected' : ''}`}
            >
                {loading ? 'Connecting...' : 
                 freighterConnected ? 'Connected' : 'Connect Wallet'}
            </button>
            
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default Login; 