const API_URL = process.env.REACT_APP_API_URL;

export const getOrders = async (assetCode, assetIssuer, status = 'all') => {
  try {
    const params = new URLSearchParams();
    if (status !== 'all') params.append('status', status);
    
    const response = await fetch(
      `${API_URL}/market/orders/${assetCode}/${assetIssuer}?${params}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch orders');
    }

    return await response.json();
  } catch (error) {
    console.error('Order service error:', error);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_URL}/market/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }

    return await response.json();
  } catch (error) {
    console.error('Order service error:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await fetch(`${API_URL}/market/orders/${orderId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel order');
    }

    return await response.json();
  } catch (error) {
    console.error('Order service error:', error);
    throw error;
  }
};

export const subscribeToOrderUpdates = (callback) => {
  const ws = new WebSocket(process.env.REACT_APP_WS_URL);

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'subscribe', channel: 'orders' }));
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'ORDER_UPDATE') {
        callback(data.payload);
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  };

  return () => {
    ws.close();
  };
}; 