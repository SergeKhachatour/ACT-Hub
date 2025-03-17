require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const StellarSdk = require('stellar-sdk');
const WebSocket = require('ws');
const http = require('http');
const swapRoutes = require('./routes/swap.routes');
const walletRoutes = require('./routes/wallet.routes');
const poolRoutes = require('./routes/pool.routes');
const marketRoutes = require('./routes/market.routes');
const authRoutes = require('./routes/auth.routes');
const connectDB = require('./config/database');
const jwt = require('jsonwebtoken');
const assetRoutes = require('./routes/assetRoutes');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3002',  // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/swap', swapRoutes);
app.use('/api/pool', poolRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/assets', assetRoutes);

// Add this after your other routes, before the static file serving
app.get('/api/test/db', async (req, res) => {
    try {
        // Test creating an alert
        const testAlert = new Alert({
            assetCode: 'TEST',
            assetIssuer: 'TEST',
            price: 1.0,
            condition: 'above',
            currentPrice: 0.5,
            userId: 'test-user'
        });
        
        await testAlert.save();
        
        // Fetch the alert we just created
        const alerts = await Alert.find({ assetCode: 'TEST' });
        
        // Clean up the test alert
        await Alert.deleteOne({ _id: testAlert._id });
        
        res.json({
            status: 'success',
            message: 'Database connection is working',
            testAlert: alerts[0]
        });
    } catch (error) {
        console.error('Database test failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Database test failed',
            error: error.message
        });
    }
});

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// WebSocket connection handling
wss.on('connection', async (ws, req) => {
    // Extract token from URL params
    const params = new URLSearchParams(req.url.split('?')[1]);
    const token = params.get('token');

    try {
        if (!token) {
            throw new Error('No authentication token');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        ws.userId = decoded.id;
        console.log('Authenticated client connected');
    } catch (error) {
        console.error('WebSocket authentication failed:', error);
        ws.close();
        return;
    }

    // Subscribe to trades only
    const tradeHandler = server.trades()
        .forAsset(new StellarSdk.Asset(assetCode, assetIssuer))
        .cursor('now')
        .stream({
            onmessage: (trade) => {
                ws.send(JSON.stringify({
                    type: 'trade',
                    data: trade
                }));
            },
            onerror: (error) => {
                console.error('Trade stream error:', error);
            }
        });

    // Store handlers for cleanup
    ws.handlers = {
        trade: tradeHandler
    };
});

// Cleanup handlers on disconnect
wss.on('close', (ws) => {
    if (ws.handlers) {
        Object.values(ws.handlers).forEach(handler => {
            if (handler && typeof handler.close === 'function') {
                handler.close();
            }
        });
    }
});

// Connect to MongoDB
connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

const PORT = process.env.PORT || 3333;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
        server.listen(PORT + 1);
    } else {
        console.error(err);
    }
}); 