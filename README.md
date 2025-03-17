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
   PORT=3001
   STELLAR_NETWORK=PUBLIC
   PORT_FRONTEND=3002
   REACT_APP_API_URL=http://localhost:3001
   REACT_APP_STELLAR_NETWORK=PUBLIC
   ```

## 🚦 Usage

1. **Start the server**
   ```bash
   npm start
   ```

2. **Access the API**
   - Base URL: `http://localhost:3001`
   - API Documentation below

## 📡 API Endpoints

### Assets
