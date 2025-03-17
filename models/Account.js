const mongoose = require('mongoose');

const BalanceSchema = new mongoose.Schema({
  assetCode: String,
  assetIssuer: String,
  balance: Number
}, { _id: false });

const AccountSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  balances: [BalanceSchema]
});

AccountSchema.methods.getBalance = function(assetCode) {
  const balance = this.balances.find(b => b.assetCode === assetCode);
  return balance ? balance.balance : 0;
};

module.exports = mongoose.model('Account', AccountSchema); 