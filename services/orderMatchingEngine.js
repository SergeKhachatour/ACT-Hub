const Order = require('../models/Order');
const Trade = require('../models/Trade');
const { wsService } = require('./websocket.service');

class OrderMatchingEngine {
  constructor() {
    this.orderBooks = new Map(); // pair -> {bids: [], asks: []}
  }

  async initializeOrderBook(assetCode, assetIssuer) {
    const key = `${assetCode}-${assetIssuer}`;
    if (!this.orderBooks.has(key)) {
      const openOrders = await Order.find({
        assetCode,
        assetIssuer,
        status: 'open'
      }).sort({ price: -1 });

      this.orderBooks.set(key, {
        bids: openOrders.filter(order => order.side === 'buy'),
        asks: openOrders.filter(order => order.side === 'sell')
      });
    }
    return this.orderBooks.get(key);
  }

  async processOrder(order) {
    const key = `${order.assetCode}-${order.assetIssuer}`;
    let orderBook = await this.initializeOrderBook(order.assetCode, order.assetIssuer);
    
    if (order.type === 'market') {
      return this.processMarketOrder(order, orderBook);
    } else {
      return this.processLimitOrder(order, orderBook);
    }
  }

  async processLimitOrder(order, orderBook) {
    const matchingSide = order.side === 'buy' ? 'asks' : 'bids';
    const matchingOrders = orderBook[matchingSide];
    const trades = [];

    let remainingAmount = order.amount;

    for (const matchingOrder of matchingOrders) {
      if (remainingAmount <= 0) break;

      const priceMatches = order.side === 'buy' 
        ? order.price >= matchingOrder.price
        : order.price <= matchingOrder.price;

      if (!priceMatches) break;

      const matchAmount = Math.min(remainingAmount, matchingOrder.amount - matchingOrder.filledAmount);
      
      if (matchAmount > 0) {
        const trade = await this.createTrade(order, matchingOrder, matchAmount);
        trades.push(trade);
        remainingAmount -= matchAmount;
      }
    }

    if (remainingAmount > 0 && order.status === 'open') {
      this.addToOrderBook(order, orderBook);
    }

    return trades;
  }

  async processMarketOrder(order, orderBook) {
    const matchingSide = order.side === 'buy' ? 'asks' : 'bids';
    const matchingOrders = orderBook[matchingSide];
    const trades = [];

    let remainingAmount = order.amount;

    for (const matchingOrder of matchingOrders) {
      if (remainingAmount <= 0) break;

      const matchAmount = Math.min(remainingAmount, matchingOrder.amount - matchingOrder.filledAmount);
      
      if (matchAmount > 0) {
        const trade = await this.createTrade(order, matchingOrder, matchAmount);
        trades.push(trade);
        remainingAmount -= matchAmount;
      }
    }

    if (remainingAmount > 0) {
      order.status = 'cancelled';
      await order.save();
    }

    return trades;
  }

  async createTrade(takerOrder, makerOrder, amount) {
    const trade = new Trade({
      assetCode: takerOrder.assetCode,
      assetIssuer: takerOrder.assetIssuer,
      price: makerOrder.price,
      amount: amount,
      takerOrderId: takerOrder._id,
      makerOrderId: makerOrder._id,
      takerUserId: takerOrder.userId,
      makerUserId: makerOrder.userId,
      side: takerOrder.side
    });

    await trade.save();

    // Update orders
    takerOrder.filledAmount += amount;
    makerOrder.filledAmount += amount;

    if (takerOrder.filledAmount >= takerOrder.amount) {
      takerOrder.status = 'filled';
    }
    if (makerOrder.filledAmount >= makerOrder.amount) {
      makerOrder.status = 'filled';
    }

    await Promise.all([
      takerOrder.save(),
      makerOrder.save()
    ]);

    // Notify via WebSocket
    wsService.notifyTrade(trade);
    wsService.notifyOrderUpdate(takerOrder);
    wsService.notifyOrderUpdate(makerOrder);

    return trade;
  }

  addToOrderBook(order, orderBook) {
    const side = order.side === 'buy' ? 'bids' : 'asks';
    orderBook[side].push(order);
    
    // Sort bids in descending order, asks in ascending order
    orderBook[side].sort((a, b) => {
      const multiplier = side === 'bids' ? -1 : 1;
      return (a.price - b.price) * multiplier;
    });
  }
}

module.exports = new OrderMatchingEngine(); 