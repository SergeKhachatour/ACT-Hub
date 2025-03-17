import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { formatPrice, formatNumber, formatDate } from '../utils/formatters';
import { getOrders, cancelOrder, subscribeToOrderUpdates } from '../services/orderService';
import { toast } from 'react-toastify';

const OrderManagement = ({ pair }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState({ open: [], filled: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);

  useEffect(() => {
    if (pair) {
      loadOrders();
      
      // Subscribe to real-time order updates
      const unsubscribe = subscribeToOrderUpdates((update) => {
        if (update.assetCode === pair.base && update.assetIssuer === pair.quote) {
          setOrders(prev => {
            const newOrders = { ...prev };
            
            // Remove the order from its current list
            ['open', 'filled'].forEach(status => {
              newOrders[status] = newOrders[status].filter(
                order => order.id !== update.id
              );
            });

            // Add the updated order to the appropriate list
            if (update.status === 'open') {
              newOrders.open.unshift(update);
            } else if (update.status === 'filled') {
              newOrders.filled.unshift(update);
            }

            return newOrders;
          });

          // Show notification for filled orders
          if (update.status === 'filled') {
            toast.success(`Order ${update.id} has been filled!`);
          }
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [pair]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrders(pair.base, pair.quote);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err.message);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (order) => {
    try {
      await cancelOrder(order.id);
      toast.success('Order cancelled successfully');
      loadOrders();
    } catch (err) {
      console.error('Failed to cancel order:', err);
      toast.error('Failed to cancel order');
    }
    setConfirmDialog(false);
  };

  const handleConfirmCancel = (order) => {
    setSelectedOrder(order);
    setConfirmDialog(true);
  };

  const renderOrderTable = (orders) => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Price</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="right">Filled</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{formatDate(order.created_at)}</TableCell>
              <TableCell sx={{ 
                color: order.side === 'buy' ? 'success.main' : 'error.main'
              }}>
                {order.side.toUpperCase()}
              </TableCell>
              <TableCell>{formatPrice(order.price)}</TableCell>
              <TableCell align="right">{formatNumber(order.amount)}</TableCell>
              <TableCell align="right">
                {formatNumber(order.filled_amount)} ({Math.round(order.filled_amount / order.amount * 100)}%)
              </TableCell>
              <TableCell align="right">{formatPrice(order.price * order.amount)}</TableCell>
              <TableCell align="right">
                {order.status === 'open' && (
                  <IconButton
                    size="small"
                    onClick={() => handleConfirmCancel(order)}
                    color="error"
                  >
                    <CancelIcon />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Order Management
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 2 }}
      >
        <Tab label="Open Orders" />
        <Tab label="Order History" />
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        renderOrderTable(activeTab === 0 ? orders.open : orders.filled)
      )}

      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
      >
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          Are you sure you want to cancel this order?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>No</Button>
          <Button 
            onClick={() => handleCancelOrder(selectedOrder)}
            color="error"
            variant="contained"
          >
            Yes, Cancel Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderManagement; 