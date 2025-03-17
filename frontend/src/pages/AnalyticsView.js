import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const AnalyticsView = () => {
    return (
        <Box p={3}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Analytics
                </Typography>
                <Typography>
                    Analytics dashboard coming soon...
                </Typography>
            </Paper>
        </Box>
    );
};

export default AnalyticsView; 