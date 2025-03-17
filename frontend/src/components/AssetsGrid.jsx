import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Skeleton,
  Alert
} from '@mui/material';
import { formatCurrency, formatNumber } from '../utils/formatters';
import './AssetsGrid.css';

const AssetsGrid = ({ assets = [], loading = false, error = null }) => {
  if (loading) {
    return (
      <TableContainer component={Paper} className="assets-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asset</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">24h Change</TableCell>
              <TableCell align="right">24h Volume</TableCell>
              <TableCell align="right">Market Cap</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(8)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Box>
                      <Skeleton width={100} />
                      <Skeleton width={60} />
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right"><Skeleton width={80} /></TableCell>
                <TableCell align="right"><Skeleton width={60} /></TableCell>
                <TableCell align="right"><Skeleton width={100} /></TableCell>
                <TableCell align="right"><Skeleton width={120} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!assets.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          No assets available
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} className="assets-table">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Asset</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">24h Change</TableCell>
            <TableCell align="right">24h Volume</TableCell>
            <TableCell align="right">Market Cap</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assets.map((asset) => (
            <TableRow 
              key={`${asset.code}-${asset.issuer}`}
              hover
              className="asset-row"
            >
              <TableCell>
                <div className="asset-cell">
                  <img 
                    src={asset.icon} 
                    alt={asset.code}
                    className="asset-icon"
                    onError={(e) => {
                      e.target.src = 'https://stellar.expert/img/assets/placeholder.png';
                    }}
                  />
                  <div className="asset-info">
                    <Typography className="asset-code">
                      {asset.code}
                    </Typography>
                    <Typography className="asset-type">
                      {asset.type}
                    </Typography>
                  </div>
                </div>
              </TableCell>
              <TableCell align="right">
                <Typography className="price">
                  {formatCurrency(asset.price)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography 
                  className={`price-change ${asset.change_24h >= 0 ? 'positive' : 'negative'}`}
                >
                  {asset.change_24h > 0 ? '+' : ''}{asset.change_24h?.toFixed(2)}%
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography className="volume">
                  {formatCurrency(asset.volume_24h)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography className="market-cap">
                  {formatCurrency(asset.market_cap)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AssetsGrid; 