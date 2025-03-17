import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material';
import { executeTrade } from '../services/marketService';
import { toast } from 'react-toastify';

const TradeForm = ({ pair, orderBook }) => {
  const [type, setType] = useState('buy');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (price && amount) {
      setTotal((parseFloat(price) * parseFloat(amount)).toFixed(8));
    } else {
      setTotal('');
    }
  }, [price, amount]);

  const handleTypeChange = (event, newType) => {
    if (newType !== null) {
      setType(newType);
      setError(null);
    }
  };

  const handlePriceChange = (event) => {
    const value = event.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPrice(value);
      setError(null);
    }
  };

  const handleAmountChange = (event) => {
    const value = event.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!pair || !price || !amount) return;

    try {
      setLoading(true);
      setError(null);
      
      await executeTrade({
        type,
        pair: `${pair.base}-${pair.quote}`,
        price: parseFloat(price),
        amount: parseFloat(amount)
      });

      toast.success('Trade executed successfully');
      setPrice('');
      setAmount('');
      setTotal('');
    } catch (err) {
      console.error('Trade execution error:', err);
      setError(err.message);
      toast.error('Failed to execute trade');
    } finally {
      setLoading(false);
    }
  };

  if (!pair) {
    return (
      <Typography color="text.secondary" align="center">
        Select a trading pair to start trading
      </Typography>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <ToggleButtonGroup
        value={type}
        exclusive
        onChange={handleTypeChange}
        fullWidth
        sx={{ mb: 2 }}
      >
        <ToggleButton 
          value="buy"
          sx={{ 
            color: 'success.main',
            '&.Mui-selected': { 
              backgroundColor: 'success.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'success.dark',
              }
            }
          }}
        >
          Buy
        </ToggleButton>
        <ToggleButton 
          value="sell"
          sx={{ 
            color: 'error.main',
            '&.Mui-selected': { 
              backgroundColor: 'error.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'error.dark',
              }
            }
          }}
        >
          Sell
        </ToggleButton>
      </ToggleButtonGroup>

      <TextField
        fullWidth
        label="Price"
        value={price}
        onChange={handlePriceChange}
        margin="normal"
        InputProps={{
          endAdornment: <InputAdornment position="end">{pair.quote}</InputAdornment>,
        }}
      />

      <TextField
        fullWidth
        label="Amount"
        value={amount}
        onChange={handleAmountChange}
        margin="normal"
        InputProps={{
          endAdornment: <InputAdornment position="end">{pair.base}</InputAdornment>,
        }}
      />

      <TextField
        fullWidth
        label="Total"
        value={total}
        disabled
        margin="normal"
        InputProps={{
          endAdornment: <InputAdornment position="end">{pair.quote}</InputAdornment>,
        }}
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color={type === 'buy' ? 'success' : 'error'}
        disabled={loading || !price || !amount}
        sx={{ mt: 2 }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          `${type === 'buy' ? 'Buy' : 'Sell'} ${pair.base}`
        )}
      </Button>
    </Box>
  );
};

export default TradeForm; 