import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import './Home.css';
import { createWallet, getBalance, fundWallet } from '../services/walletService';
import { checkFreighterConnection, getFreighterPublicKey, connectFreighter } from '../services/freighterService';
import AssetsGrid from '../components/AssetsGrid';
import { getAssets, subscribeToAssetUpdates } from '../services/assetService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);
  const [freighterConnected, setFreighterConnected] = useState(false);
  const [freighterPublicKey, setFreighterPublicKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initFreighter = async () => {
      try {
        setIsLoading(true);
        const connected = await checkFreighterConnection();
        console.log('Initial connection check:', connected);
        
        if (connected) {
          try {
            const publicKey = await getFreighterPublicKey();
            setFreighterConnected(true);
            setFreighterPublicKey(publicKey);
          } catch (err) {
            console.error('Failed to get public key:', err);
          }
        }
      } catch (err) {
        console.error('Freighter initialization failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initFreighter();
  }, []);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const data = await getAssets();
        setAssets(data);
        setError(null);
      } catch (error) {
        console.error('Error loading assets:', error);
        setError(error.message);
        toast.error('Failed to load assets');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToAssetUpdates((tradeData) => {
      setAssets(prevAssets => {
        return prevAssets.map(asset => {
          if (asset.code === tradeData.base_asset_code) {
            // Update asset with new trade data
            const newPrice = parseFloat(tradeData.price);
            const priceChange = ((newPrice - asset.price) / asset.price) * 100;
            
            return {
              ...asset,
              price: newPrice,
              change_24h: asset.change_24h + priceChange,
              volume_24h: asset.volume_24h + parseFloat(tradeData.base_amount)
            };
          }
          return asset;
        });
      });
    });

    // Refresh data every minute
    const refreshInterval = setInterval(fetchAssets, 60000);

    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  const handleConnectFreighter = async () => {
    try {
      setError(null);
      console.log('Connecting to Freighter...');
      const publicKey = await connectFreighter();
      console.log('Connected with public key:', publicKey);
      
      if (!publicKey) {
        throw new Error('No public key received from Freighter');
      }

      setFreighterConnected(true);
      setFreighterPublicKey(publicKey);
    } catch (err) {
      console.error('Freighter connection error:', err);
      setFreighterConnected(false);
      setFreighterPublicKey(null);
      setError(`Failed to connect to Freighter: ${err.message}`);
    }
  };

  const handleCreateWallet = async () => {
    try {
      const newWallet = await createWallet();
      setWallet(newWallet);
      setError(null);
    } catch (err) {
      setError('Failed to create wallet');
    }
  };

  const handleCheckBalance = async () => {
    if (!wallet?.publicKey) return;
    try {
      const balanceData = await getBalance(wallet.publicKey);
      setBalance(balanceData.balances);
      setError(null);
    } catch (err) {
      setError('Failed to fetch balance');
    }
  };

  const handleFundWallet = async () => {
    if (!wallet?.publicKey) return;
    if (!freighterConnected) {
      setError('Please connect your Freighter wallet first');
      return;
    }
    try {
      await fundWallet(wallet.publicKey);
      const balanceData = await getBalance(wallet.publicKey);
      setBalance(balanceData.balances);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          className="page-title"
          sx={{ 
            mb: 4, 
            fontWeight: 600,
          }}
        >
          Welcome to Stellar Trading
        </Typography>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Trade Assets
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Buy and sell Stellar assets with advanced trading features
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/market')}
                >
                  Go to Market
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Manage Wallet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  View balances and transaction history
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/wallet')}
                >
                  Open Wallet
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Liquidity Pools
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Provide liquidity and earn rewards
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/pool')}
                >
                  View Pools
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography 
          variant="h5" 
          className="section-title"
          sx={{ 
            mb: 3,
            fontWeight: 600,
          }}
        >
          Popular Assets
        </Typography>
        
        <AssetsGrid 
          assets={assets} 
          loading={loading} 
          error={error}
        />
      </Box>
    </Container>
  );
};

export default Home; 