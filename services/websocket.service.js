class WebSocketService {
  // ... existing methods ...

  notifyOrderUpdate(order) {
    this.broadcast('orders', {
      type: 'ORDER_UPDATE',
      payload: order
    });
  }

  notifyTrade(trade) {
    this.broadcast(`trades.${trade.assetCode}-${trade.assetIssuer}`, {
      type: 'TRADE',
      payload: trade
    });
  }

  broadcast(channel, message) {
    const subscribers = this.subscribers.get(channel);
    if (subscribers) {
      subscribers.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    }
  }
}

// ... rest of the code ... 