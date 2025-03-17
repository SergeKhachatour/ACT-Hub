import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Paper,
  TablePagination,
  CircularProgress
} from '@mui/material';
import { formatNumber, formatPrice, formatDate } from '../utils/formatters';
import { getTradeHistory } from '../services/marketService';

const TradeHistory = ({ pair }) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const loadTrades = async (newPage) => {
    if (!pair) return;

    try {
      setLoading(true);
      const response = await getTradeHistory(
        pair.base,
        pair.quote,
        rowsPerPage,
        newPage * rowsPerPage
      );
      setTrades(response.trades);
      setTotalCount(response.total);
    } catch (error) {
      console.error('Failed to load trade history:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadTrades(page);
  }, [pair, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!pair) {
    return (
      <Typography color="text.secondary" align="center">
        Select a trading pair to view history
      </Typography>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Price</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : (
              trades.map((trade) => (
                <TableRow 
                  key={trade.id}
                  sx={{ 
                    color: trade.side === 'buy' ? 'success.main' : 'error.main',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <TableCell>{formatDate(trade.timestamp)}</TableCell>
                  <TableCell sx={{ 
                    color: trade.side === 'buy' ? 'success.main' : 'error.main'
                  }}>
                    {formatPrice(trade.price)}
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(trade.amount)}
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(trade.price * trade.amount)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </Box>
  );
};

export default TradeHistory; 