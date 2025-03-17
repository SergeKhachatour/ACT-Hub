import React from 'react';
import './TradeConfirmModal.css';

const TradeConfirmModal = ({ trade, onConfirm, onCancel }) => {
    const { orderType, amount, price, assetCode } = trade;
    const total = Number(amount) * Number(price);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Confirm Trade</h2>
                <div className="trade-details">
                    <div className="detail-row">
                        <span>Type:</span>
                        <span className={orderType}>{orderType.toUpperCase()}</span>
                    </div>
                    <div className="detail-row">
                        <span>Amount:</span>
                        <span>{amount} {assetCode}</span>
                    </div>
                    <div className="detail-row">
                        <span>Price:</span>
                        <span>{price} XLM</span>
                    </div>
                    <div className="detail-row total">
                        <span>Total:</span>
                        <span>{total.toFixed(7)} XLM</span>
                    </div>
                </div>
                <div className="modal-actions">
                    <button 
                        className="cancel-button"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button 
                        className={`confirm-button ${orderType}`}
                        onClick={onConfirm}
                    >
                        Confirm {orderType}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TradeConfirmModal; 