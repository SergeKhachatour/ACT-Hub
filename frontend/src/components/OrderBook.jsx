import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Paper
} from '@mui/material';
import { formatNumber, formatPrice } from '../utils/formatters';

const OrderBook = ({ pair, data }) => {
  if (!pair || !data) {
    return (
      <Typography color="text.secondary" align="center">
        No order book data available
      </Typography>
    );
  }

  return (
    <Box>
      {/* Asks (Sell Orders) */}
      <TableContainer component={Paper} sx={{ mb: 2, maxHeight: 200 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Price ({pair.quote})</TableCell>
              <TableCell align="right">Amount ({pair.base})</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.asks.slice().reverse().map((ask, index) => (
              <TableRow 
                key={`ask-${index}`}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    cursor: 'pointer'
                  }
                }}
              >
                <TableCell sx={{ color: 'error.main' }}>
                  {formatPrice(ask.price)}
                </TableCell>
                <TableCell align="right">{formatNumber(ask.amount)}</TableCell>
                <TableCell align="right">{formatNumber(ask.price * ask.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Current Price */}
      <Box sx={{ 
        py: 1, 
        textAlign: 'center',
        borderTop: 1,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Typography variant="h6" color="primary">
          {formatPrice(data.lastPrice)} {pair.quote}
        </Typography>
      </Box>

      {/* Bids (Buy Orders) */}
      <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 200 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Price ({pair.quote})</TableCell>
              <TableCell align="right">Amount ({pair.base})</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.bids.map((bid, index) => (
              <TableRow 
                key={`bid-${index}`}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    cursor: 'pointer'
                  }
                }}
              >
                <TableCell sx={{ color: 'success.main' }}>
                  {formatPrice(bid.price)}
                </TableCell>
                <TableCell align="right">{formatNumber(bid.amount)}</TableCell>
                <TableCell align="right">{formatNumber(bid.price * bid.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OrderBook; 