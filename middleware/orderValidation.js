const { check, validationResult } = require('express-validator');
const Account = require('../models/Account');

exports.validateOrder = [
  check('assetCode').notEmpty().trim(),
  check('assetIssuer').notEmpty().trim(),
  check('type').isIn(['limit', 'market']),
  check('side').isIn(['buy', 'sell']),
  check('amount').isFloat({ min: 0.000001 }),
  check('price').optional({ nullable: true }).isFloat({ min: 0 }),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const account = await Account.findOne({ userId: req.user.id });
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      const { side, amount, price, assetCode } = req.body;
      
      if (side === 'sell') {
        const balance = account.getBalance(assetCode);
        if (balance < amount) {
          return res.status(400).json({ error: 'Insufficient balance' });
        }
      } else if (side === 'buy' && req.body.type === 'limit') {
        const totalCost = amount * price;
        const quoteBalance = account.getBalance('XLM'); // Assuming XLM is quote currency
        if (quoteBalance < totalCost) {
          return res.status(400).json({ error: 'Insufficient funds' });
        }
      }

      next();
    } catch (error) {
      console.error('Order validation error:', error);
      res.status(500).json({ error: 'Order validation failed' });
    }
  }
]; 