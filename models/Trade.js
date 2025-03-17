const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
  assetCode: {
    type: String,
    required: true
  },
  assetIssuer: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  takerOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  makerOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  takerUserId: {
    type: String,
    required: true
  },
  makerUserId: {
    type: String,
    required: true
  },
  side: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
TradeSchema.index({ assetCode: 1, assetIssuer: 1 });
TradeSchema.index({ timestamp: -1 });
TradeSchema.index({ takerUserId: 1 });
TradeSchema.index({ makerUserId: 1 });

module.exports = mongoose.model('Trade', TradeSchema); 