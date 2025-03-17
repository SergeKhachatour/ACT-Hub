const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ error: 'Not authorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({ error: 'User not found' });
        }

        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Not authorized' });
    }
};

module.exports = { protect }; 