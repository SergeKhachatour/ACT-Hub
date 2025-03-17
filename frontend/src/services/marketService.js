import { wsService } from './websocketService';

const API_URL = process.env.REACT_APP_API_URL;

export const getAssets = async (cursor = null, limit = 20) => {
    try {
        const params = new URLSearchParams({
            limit: limit.toString()
        });
        if (cursor) {
            params.append('cursor', cursor);
        }

        const response = await fetch(`${API_URL}/api/market/assets?${params}`);
        if (!response.ok) {
            throw new Error('Failed to fetch assets');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching assets:', error);
        throw error;
    }
};

export const getOrderBook = async (assetCode, assetIssuer) => {
    try {
        const response = await fetch(
            `${API_URL}/api/market/orderbook/${assetCode}/${assetIssuer}`
        );
        if (!response.ok) {
            throw new Error('Failed to fetch order book');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching order book:', error);
        throw error;
    }
};

export const getTradeHistory = async (assetCode, assetIssuer, limit = 20) => {
    try {
        const response = await fetch(
            `${API_URL}/api/market/trades/${assetCode}/${assetIssuer}?limit=${limit}`
        );
        if (!response.ok) {
            throw new Error('Failed to fetch trade history');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching trade history:', error);
        throw error;
    }
};

export const getPriceHistory = async (assetCode, assetIssuer, resolution = '1h') => {
    try {
        const response = await fetch(
            `${API_URL}/api/market/price-history/${assetCode}/${assetIssuer}?resolution=${resolution}`
        );
        if (!response.ok) {
            throw new Error('Failed to fetch price history');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching price history:', error);
        throw error;
    }
};

export const getMarketData = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/market/data`);
    if (!response.ok) {
      throw new Error('Failed to fetch market data');
    }
    return await response.json();
  } catch (error) {
    console.error('Market service error:', error);
    throw error;
  }
};

export const subscribeToMarketUpdates = (pair, callbacks) => {
  const channels = {
    orderBook: `orderbook.${pair}`,
    trades: `trades.${pair}`,
    ticker: `ticker.${pair}`
  };

  const subscriptions = [];

  if (callbacks.onOrderBookUpdate) {
    subscriptions.push(
      wsService.subscribe(channels.orderBook, callbacks.onOrderBookUpdate)
    );
  }

  if (callbacks.onTradeUpdate) {
    subscriptions.push(
      wsService.subscribe(channels.trades, callbacks.onTradeUpdate)
    );
  }

  if (callbacks.onTickerUpdate) {
    subscriptions.push(
      wsService.subscribe(channels.ticker, callbacks.onTickerUpdate)
    );
  }

  return () => subscriptions.forEach(unsubscribe => unsubscribe());
};

export const executeTrade = async (tradeData) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/market/trade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tradeData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to execute trade');
    }

    return await response.json();
  } catch (error) {
    console.error('Trade execution error:', error);
    throw error;
  }
}; 