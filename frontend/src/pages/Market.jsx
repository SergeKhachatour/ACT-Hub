import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Paper } from '@mui/material';
import TradeHistory from '../components/TradeHistory';
import { getAssetDetails } from '../services/assetService';

const Market = () => {
    const { code, issuer } = useParams();
    const [asset, setAsset] = useState(null);
    const [trades, setTrades] = useState([]);

    useEffect(() => {
        const fetchAssetDetails = async () => {
            try {
                const data = await getAssetDetails(code, issuer);
                setAsset(data);
            } catch (error) {
                console.error('Error fetching asset details:', error);
            }
        };

        fetchAssetDetails();
    }, [code, issuer]);

    useEffect(() => {
        // WebSocket connection for trades
        const ws = new WebSocket(`ws://localhost:3333?token=${localStorage.getItem('token')}`);
        
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'trade') {
                setTrades(prevTrades => [message.data, ...prevTrades].slice(0, 50));
            }
        };

        return () => {
            ws.close();
        };
    }, [code, issuer]);

    return (
        <Container maxWidth="lg">
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper>
                        <h1>{code}</h1>
                        {asset && (
                            <div>
                                <p>Issuer: {issuer || 'Native'}</p>
                                {/* Add more asset details here */}
                            </div>
                        )}
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <TradeHistory trades={trades} />
                </Grid>
            </Grid>
        </Container>
    );
};

export default Market; 