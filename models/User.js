const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    publicKey: {
        type: String,
        required: true,
        unique: true
    },
    nonce: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate authentication nonce
UserSchema.methods.generateNonce = function() {
    const nonce = Math.floor(Math.random() * 1000000).toString();
    this.nonce = nonce;
    return nonce;
};

// Generate JWT Token
UserSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { id: this._id, publicKey: this.publicKey },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

module.exports = mongoose.model('User', UserSchema); 