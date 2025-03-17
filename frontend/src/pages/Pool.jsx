import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import { getLiquidityPools, addLiquidity, removeLiquidity } from '../services/poolService';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { toast } from 'react-toastify';

const Pool = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPool, setSelectedPool] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [amount1, setAmount1] = useState('');
  const [amount2, setAmount2] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        setLoading(true);
        const data = await getLiquidityPools();
        setPools(data);
        setError(null);
      } catch (err) {
        console.error('Error loading pools:', err);
        setError(err.message);
        toast.error('Failed to load liquidity pools');
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setAmount1('');
    setAmount2('');
  };

  const handlePoolSelect = (pool) => {
    setSelectedPool(pool);
    setActiveTab(0);
  };

  const handleAddLiquidity = async () => {
    if (!selectedPool || !amount1 || !amount2) return;

    try {
      setProcessing(true);
      await addLiquidity({
        poolId: selectedPool.id,
        amount1: parseFloat(amount1),
        amount2: parseFloat(amount2)
      });
      toast.success('Liquidity added successfully');
      // Refresh pools
      const updatedPools = await getLiquidityPools();
      setPools(updatedPools);
    } catch (err) {
      console.error('Error adding liquidity:', err);
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!selectedPool || !amount1) return;

    try {
      setProcessing(true);
      await removeLiquidity({
        poolId: selectedPool.id,
        amount: parseFloat(amount1)
      });
      toast.success('Liquidity removed successfully');
      // Refresh pools
      const updatedPools = await getLiquidityPools();
      setPools(updatedPools);
    } catch (err) {
      console.error('Error removing liquidity:', err);
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Pool List */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Liquidity Pools
              </Typography>
              {error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Assets</TableCell>
                        <TableCell align="right">TVL</TableCell>
                        <TableCell align="right">Volume (24h)</TableCell>
                        <TableCell align="right">APR</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pools.map((pool) => (
                        <TableRow 
                          key={pool.id} 
                          hover
                          selected={selectedPool?.id === pool.id}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography>
                                {pool.asset1}/{pool.asset2}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(pool.tvl)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(pool.volume24h)}
                          </TableCell>
                          <TableCell align="right">
                            {formatNumber(pool.apr)}%
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handlePoolSelect(pool)}
                            >
                              Select
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pool Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedPool ? `${selectedPool.asset1}/${selectedPool.asset2} Pool` : 'Select a Pool'}
              </Typography>
              
              {selectedPool && (
                <>
                  <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                    <Tab label="Add Liquidity" />
                    <Tab label="Remove Liquidity" />
                  </Tabs>

                  {activeTab === 0 ? (
                    <Box>
                      <TextField
                        fullWidth
                        label={`${selectedPool.asset1} Amount`}
                        type="number"
                        value={amount1}
                        onChange={(e) => setAmount1(e.target.value)}
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label={`${selectedPool.asset2} Amount`}
                        type="number"
                        value={amount2}
                        onChange={(e) => setAmount2(e.target.value)}
                        margin="normal"
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleAddLiquidity}
                        disabled={processing || !amount1 || !amount2}
                        sx={{ mt: 2 }}
                      >
                        {processing ? 'Processing...' : 'Add Liquidity'}
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <TextField
                        fullWidth
                        label="LP Token Amount"
                        type="number"
                        value={amount1}
                        onChange={(e) => setAmount1(e.target.value)}
                        margin="normal"
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        onClick={handleRemoveLiquidity}
                        disabled={processing || !amount1}
                        sx={{ mt: 2 }}
                      >
                        {processing ? 'Processing...' : 'Remove Liquidity'}
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Pool; 