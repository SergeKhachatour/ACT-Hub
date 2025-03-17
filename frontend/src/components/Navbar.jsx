import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Typography, 
  Box,
  Container,
  IconButton,
  useTheme
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Market', path: '/market' },
    { label: 'Wallet', path: '/wallet' },
    { label: 'Pool', path: '/pool' },
  ];

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'background.paper' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <IconButton 
            color="primary"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <AccountBalanceWalletIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 0, 
              mr: 4, 
              color: 'text.primary',
              fontWeight: 600 
            }}
          >
            Stellar Trading
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  color: 'text.primary',
                  px: 2,
                  py: 1,
                  backgroundColor: location.pathname === item.path ? 
                    'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.05)'
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {user ? (
            <Button 
              color="primary"
              variant="outlined"
              onClick={logout}
              sx={{ ml: 2 }}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              color="primary"
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{ ml: 2 }}
            >
              Connect Wallet
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 