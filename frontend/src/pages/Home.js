import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import AssetGrid from '../components/AssetGrid';

const Home = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch('/api/assets');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setAssets(data);
            } catch (error) {
                console.error('Error fetching assets:', error);
                setError('Failed to load assets. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAssets();
    }, []);

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Stellar Assets
            </Typography>
            
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <AssetGrid assets={assets} />
            )}
        </Box>
    );
};

export default Home; 