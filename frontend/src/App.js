import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme';
import NavMenu from './components/NavMenu';
import Home from './pages/Home';
import PoolsView from './components/PoolsView';
import SwapView from './pages/SwapView';
import AnalyticsView from './pages/AnalyticsView';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <NavMenu />
                    <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/pools/:code/:issuer" element={<PoolsView />} />
                            <Route path="/pools" element={<PoolsView />} />
                            <Route path="/swap" element={<SwapView />} />
                            <Route path="/analytics" element={<AnalyticsView />} />
                        </Routes>
                    </Box>
                </Box>
            </Router>
        </ThemeProvider>
    );
}

export default App; 