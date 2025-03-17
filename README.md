# ACT Hub - Stellar Asset Explorer

A real-time Stellar network asset explorer focused on tracking LOBSTR curated assets, market caps, and prices.

## 🚀 Features

- **Asset Tracking**
  - Real-time price updates
  - Market cap calculations
  - Holder statistics
  - Asset type classification

- **Supported Assets**
  - Native XLM
  - Stablecoins (USDC, EURT)
  - Wrapped Assets (yXLM, yBTC, yETH)
  - LOBSTR Curated Assets (AQUA, LSP, ACT, etc.)

- **Price Discovery**
  - USDC orderbook integration
  - CoinGecko API for BTC/ETH prices
  - Automatic fallback prices

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd act-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```
   PORT=3333
   STELLAR_NETWORK=PUBLIC
   PORT_FRONTEND=3002
   REACT_APP_API_URL=http://localhost:3333
   REACT_APP_STELLAR_NETWORK=PUBLIC
   ```

## 🚦 Usage

1. **Start the server**
   ```bash
   npm start
   ```

2. **Access the API**
   - Base URL: `http://localhost:3333`
   - API Documentation below

## 📡 API Endpoints

### Assets

- GET /api/assets - Get all assets
- GET /api/assets/top - Get top assets
- GET /api/assets/:code/:issuer - Get asset details

### Pools

- GET /api/pools?asset_code=CODE&asset_issuer=ISSUER - Get pools for asset
- GET /api/pools/:pool_id - Get pool details
- GET /api/pools/:pool_id/trades - Get pool trades

## Environment Setup

1. Backend (.env):
```env
PORT=3333
STELLAR_NETWORK=PUBLIC
```

2. Frontend (.env):
```env
REACT_APP_API_URL=http://localhost:3333
REACT_APP_STELLAR_NETWORK=PUBLIC
```

## Available Routes

### Assets
- GET /api/assets - Get all assets
- GET /api/assets/top - Get top assets
- GET /api/assets/:code/:issuer - Get asset details

### Pools
- GET /api/pools?asset_code=CODE&asset_issuer=ISSUER - Get pools for asset
- GET /api/pools/:pool_id - Get pool details
- GET /api/pools/:pool_id/trades - Get pool trades
