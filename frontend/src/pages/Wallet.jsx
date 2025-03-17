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
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { getBalance, getTransactions } from '../services/walletService';
import * as freighterApi from '@stellar/freighter-api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

const Wallet = () => {
  const [balances, setBalances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publicKey, setPublicKey] = useState(null);

  useEffect(() => {
    const initWallet = async () => {
      try {
        setLoading(true);
        const isConnected = await freighterApi.isConnected();
        if (!isConnected) {
          throw new Error('Freighter not connected');
        }

        const key = await freighterApi.getPublicKey();
        setPublicKey(key);

        // Fetch balances and transactions
        const [balanceData, txData] = await Promise.all([
          getBalance(key),
          getTransactions(key)
        ]);

        setBalances(balanceData.balances);
        setTransactions(txData);
        setError(null);
      } catch (err) {
        console.error('Wallet initialization error:', err);
        setError(err.message);
        toast.error('Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };

    initWallet();
  }, []);

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
        {/* Wallet Info */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Wallet Overview
              </Typography>
              {error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              ) : (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Public Key
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'monospace',
                      bgcolor: 'background.paper',
                      p: 1,
                      borderRadius: 1,
                      wordBreak: 'break-all'
                    }}
                  >
                    {publicKey}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Balances */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Balances
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Asset</TableCell>
                      <TableCell align="right">Balance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {balances.map((balance) => (
                      <TableRow key={balance.asset_type + (balance.asset_code || '')}>
                        <TableCell>
                          {balance.asset_type === 'native' ? 'XLM' : balance.asset_code}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(balance.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} hover>
                        <TableCell>{formatDate(tx.created_at)}</TableCell>
                        <TableCell>{tx.type}</TableCell>
                        <TableCell align="right">
                          {tx.amount && formatCurrency(tx.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Wallet; 