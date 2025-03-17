import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { theme } from './theme/theme';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Market from './pages/Market';
import Wallet from './pages/Wallet';
import Pool from './pages/Pool';
import Login from './components/Login';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ 
            minHeight: '100vh',
            backgroundColor: 'background.default',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Navbar />
            <Box sx={{ flex: 1, p: 3 }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } />
                <Route path="/market" element={
                  <ProtectedRoute>
                    <Market />
                  </ProtectedRoute>
                } />
                <Route path="/wallet" element={
                  <ProtectedRoute>
                    <Wallet />
                  </ProtectedRoute>
                } />
                <Route path="/pool" element={
                  <ProtectedRoute>
                    <Pool />
                  </ProtectedRoute>
                } />
              </Routes>
            </Box>
          </Box>
          <ToastContainer
            position="bottom-right"
            theme="dark"
            style={{ fontSize: '14px' }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 