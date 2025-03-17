# ACT Hub - Stellar Asset Trading Hub

A comprehensive trading platform for Stellar assets with liquidity pool management, asset swapping, and real-time analytics.

## Features

- 🌟 Asset Discovery & Management
- 💧 Liquidity Pool Analytics
- 💱 Asset Swapping
- 📊 Real-time Market Data
- 📱 Responsive Design
- 🔄 Real-time Updates

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Git

## MongoDB Setup

1. Install MongoDB Community Edition:
   ```bash
   # Windows (using chocolatey)
   choco install mongodb

   # macOS (using homebrew)
   brew tap mongodb/brew
   brew install mongodb-community

   # Ubuntu
   sudo apt update
   sudo apt install mongodb
   ```

2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB

   # macOS
   brew services start mongodb-community

   # Ubuntu
   sudo systemctl start mongodb
   ```

3. Verify MongoDB is running:
   ```bash
   mongosh
   ```

4. Create a new database and user:
   ```javascript
   use act_hub_db
   db.createUser({
     user: "act_hub_user",
     pwd: "your_password",
     roles: ["readWrite"]
   })
   ```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/act-hub.git
   cd act-hub
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

4. Create .env files:

   Backend (.env):
   ```env
   PORT=3333
   MONGODB_URI=mongodb://localhost:27017/act_hub_db
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

   Frontend (frontend/.env):
   ```env
   PORT=3002
   REACT_APP_API_URL=http://localhost:3333
   REACT_APP_STELLAR_NETWORK=TESTNET
   REACT_APP_DOMAIN=localhost
   REACT_APP_WS_URL=ws://localhost:3333
   ```

## Running the Application

1. Start the backend server:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run prod
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3002
- Backend API: http://localhost:3333

## API Endpoints

### Assets
- `GET /api/assets` - Get all assets
- `GET /api/assets/top` - Get top assets
- `GET /api/assets/search/:query` - Search assets
- `GET /api/assets/:code/:issuer` - Get asset details

### Liquidity Pools
- `GET /api/pools` - Get all pools
- `GET /api/pools/:pool_id` - Get pool details
- `GET /api/pools/:pool_id/trades` - Get pool trades

### Market Data
- `GET /api/market/prices` - Get current prices
- `GET /api/market/volume` - Get trading volume

## Development

### Project Structure
```
act-hub/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── theme.js
│   └── package.json
├── controllers/        # API controllers
├── routes/            # API routes
├── models/            # Database models
├── config/            # Configuration files
├── server.js          # Express server
└── package.json
```

### Technologies Used

- Frontend:
  - React
  - Material-UI
  - Recharts
  - React Router

- Backend:
  - Node.js
  - Express
  - MongoDB
  - Stellar SDK
  - WebSocket

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
