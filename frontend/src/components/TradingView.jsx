import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { getOrderBook, getTradeHistory, getPriceHistory } from '../services/marketService';
import { wsService } from '../services/websocketService';
import { executeTrade } from '../services/tradeService';
import './TradingView.css';
import { ToastContainer, toast } from 'react-toastify';
import TradeConfirmModal from './TradeConfirmModal';
import 'react-toastify/dist/ReactToastify.css';
import StellarSdk from 'stellar-sdk';
import PriceAlert from './PriceAlert';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const MAX_PRICE_POINTS = 100;

const TradingView = ({ asset }) => {
    const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
    const [tradeHistory, setTradeHistory] = useState([]);
    const [priceHistory, setPriceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState('');
    const [orderType, setOrderType] = useState('buy');
    const [isTrading, setIsTrading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingTrade, setPendingTrade] = useState(null);
    const [totalCost, setTotalCost] = useState('0');
    const [validationErrors, setValidationErrors] = useState({});
    const [balance, setBalance] = useState({ XLM: '0', [asset.asset_code]: '0' });
    const chartRef = useRef(null);

    const fetchBalances = useCallback(async () => {
        try {
            const publicKey = await window.freighter.getPublicKey();
            const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
            const account = await server.loadAccount(publicKey);
            
            const balances = account.balances.reduce((acc, b) => {
                if (b.asset_type === 'native') {
                    acc.XLM = b.balance;
                } else if (b.asset_code === asset.asset_code && 
                          b.asset_issuer === asset.asset_issuer) {
                    acc[asset.asset_code] = b.balance;
                }
                return acc;
            }, { XLM: '0', [asset.asset_code]: '0' });

            setBalance(balances);
        } catch (error) {
            console.error('Error fetching balances:', error);
            setError('Failed to fetch balances');
        }
    }, [asset.asset_code, asset.asset_issuer]);

    const loadInitialData = useCallback(async () => {
        try {
            setLoading(true);
            const [orderBookData, tradeHistoryData, priceHistoryData] = await Promise.all([
                getOrderBook(asset.asset_code, asset.asset_issuer),
                getTradeHistory(asset.asset_code, asset.asset_issuer),
                getPriceHistory(asset.asset_code, asset.asset_issuer)
            ]);

            setOrderBook(orderBookData);
            setTradeHistory(tradeHistoryData.records);
            setPriceHistory(priceHistoryData);
            setError(null);
        } catch (err) {
            setError('Failed to load market data');
            console.error('Error loading market data:', err);
        } finally {
            setLoading(false);
        }
    }, [asset.asset_code, asset.asset_issuer]);

    const setupWebSocket = useCallback(() => {
        wsService.connect();
        wsService.subscribe(asset.asset_code, asset.asset_issuer);

        // Handle trade updates
        wsService.addSubscriber('trade', (trade) => {
            setTradeHistory(prev => {
                const newTrades = [trade, ...prev];
                return newTrades.slice(0, 50); // Keep last 50 trades
            });

            // Update price history
            setPriceHistory(prev => {
                const newPoint = {
                    timestamp: new Date(trade.ledger_close_time),
                    price: Number(trade.price)
                };
                const newHistory = [...prev, newPoint];
                return newHistory.slice(-MAX_PRICE_POINTS);
            });
        });

        // Handle orderbook updates
        wsService.addSubscriber('orderbook', (newOrderBook) => {
            setOrderBook(prev => ({
                bids: [...newOrderBook.bids],
                asks: [...newOrderBook.asks]
            }));
        });
    }, [asset.asset_code, asset.asset_issuer]);

    useEffect(() => {
        fetchBalances();
        loadInitialData();
        setupWebSocket();
        
        return () => {
            wsService.disconnect();
        };
    }, [fetchBalances, loadInitialData, setupWebSocket]);

    const validateForm = () => {
        const errors = {};
        
        if (!amount || Number(amount) <= 0) {
            errors.amount = 'Amount must be greater than 0';
        }
        
        if (!price || Number(price) <= 0) {
            errors.price = 'Price must be greater than 0';
        }

        // Check if amount has too many decimal places
        if (amount && amount.toString().split('.')[1]?.length > 7) {
            errors.amount = 'Maximum 7 decimal places allowed';
        }

        // Check if price has too many decimal places
        if (price && price.toString().split('.')[1]?.length > 7) {
            errors.price = 'Maximum 7 decimal places allowed';
        }

        // Check balances
        if (orderType === 'buy') {
            const totalCost = Number(amount) * Number(price);
            if (totalCost > Number(balance.XLM)) {
                errors.amount = 'Insufficient XLM balance';
            }
        } else {
            if (Number(amount) > Number(balance[asset.asset_code])) {
                errors.amount = `Insufficient ${asset.asset_code} balance`;
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        setAmount(value);
        if (price) {
            setTotalCost((Number(value) * Number(price)).toFixed(7));
        }
    };

    const handlePriceChange = (e) => {
        const value = e.target.value;
        setPrice(value);
        if (amount) {
            setTotalCost((Number(amount) * Number(value)).toFixed(7));
        }
    };

    const handleTrade = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const tradeData = {
            orderType,
            amount,
            price,
            assetCode: asset.asset_code,
            assetIssuer: asset.asset_issuer
        };
        setPendingTrade(tradeData);
        setShowConfirmModal(true);
    };

    const handleConfirmTrade = async () => {
        try {
            setIsTrading(true);
            setError(null);
            
            const result = await executeTrade(pendingTrade);
            
            // Clear form
            setAmount('');
            setPrice('');
            setShowConfirmModal(false);
            
            // Show success notification
            toast.success('Trade executed successfully!', {
                position: "top-right",
                autoClose: 5000
            });
            
        } catch (error) {
            setError(error.message || 'Failed to execute trade');
            toast.error(error.message || 'Failed to execute trade', {
                position: "top-right",
                autoClose: 5000
            });
        } finally {
            setIsTrading(false);
        }
    };

    const chartData = {
        labels: priceHistory.map(p => new Date(p.timestamp).toLocaleTimeString()),
        datasets: [{
            label: `${asset.asset_code}/XLM Price`,
            data: priceHistory.map(p => p.price),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            fill: false
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 0 // Disable animation for real-time updates
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Price History'
            }
        },
        scales: {
            y: {
                beginAtZero: false
            }
        }
    };

    return (
        <div className="trading-view">
            <div className="trading-header">
                <h2>{asset.asset_code}/XLM Trading</h2>
                {error && <div className="error-message">{error}</div>}
            </div>

            <div className="trading-grid">
                <div className="chart-container">
                    <Line data={chartData} options={chartOptions} ref={chartRef} />
                </div>

                <div className="order-book">
                    <h3>Order Book</h3>
                    <div className="order-lists">
                        <div className="asks">
                            <h4>Asks</h4>
                            {orderBook.asks.map((ask, i) => (
                                <div key={i} className="order-row">
                                    <span>{Number(ask.price).toFixed(7)}</span>
                                    <span>{Number(ask.amount).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="bids">
                            <h4>Bids</h4>
                            {orderBook.bids.map((bid, i) => (
                                <div key={i} className="order-row">
                                    <span>{Number(bid.price).toFixed(7)}</span>
                                    <span>{Number(bid.amount).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="trading-form">
                    <h3>Place Order</h3>
                    <form onSubmit={handleTrade}>
                        <div className="form-group">
                            <label>Type</label>
                            <select 
                                value={orderType} 
                                onChange={(e) => setOrderType(e.target.value)}
                            >
                                <option value="buy">Buy</option>
                                <option value="sell">Sell</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Amount ({asset.asset_code})</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={handleAmountChange}
                                min="0"
                                step="0.0000001"
                                required
                                className={validationErrors.amount ? 'error' : ''}
                            />
                            {validationErrors.amount && (
                                <div className="error-message">{validationErrors.amount}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Price (XLM)</label>
                            <input
                                type="number"
                                value={price}
                                onChange={handlePriceChange}
                                min="0"
                                step="0.0000001"
                                required
                                className={validationErrors.price ? 'error' : ''}
                            />
                            {validationErrors.price && (
                                <div className="error-message">{validationErrors.price}</div>
                            )}
                        </div>

                        <div className="form-group total-section">
                            <label>Total Cost (XLM)</label>
                            <div className="total-amount">{totalCost}</div>
                        </div>

                        <div className="form-group balance-section">
                            <div className="balance-row">
                                <span>XLM Balance:</span>
                                <span>{Number(balance.XLM).toFixed(7)}</span>
                            </div>
                            <div className="balance-row">
                                <span>{asset.asset_code} Balance:</span>
                                <span>{Number(balance[asset.asset_code]).toFixed(7)}</span>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className={`submit-button ${orderType}`}
                            disabled={isTrading || Object.keys(validationErrors).length > 0}
                        >
                            {isTrading ? 'Processing...' : `${orderType === 'buy' ? 'Buy' : 'Sell'} ${asset.asset_code}`}
                        </button>
                    </form>
                </div>

                <div className="trade-history">
                    <h3>Recent Trades</h3>
                    <div className="trade-list">
                        {tradeHistory.map((trade, i) => (
                            <div key={i} className="trade-row">
                                <span>{new Date(trade.ledger_close_time).toLocaleTimeString()}</span>
                                <span className={trade.base_is_seller ? 'sell' : 'buy'}>
                                    {Number(trade.price).toFixed(7)}
                                </span>
                                <span>{Number(trade.base_amount).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <PriceAlert 
                    asset={asset} 
                    currentPrice={priceHistory[priceHistory.length - 1]?.price || 0}
                />
            </div>

            {showConfirmModal && (
                <TradeConfirmModal
                    trade={pendingTrade}
                    onConfirm={handleConfirmTrade}
                    onCancel={() => setShowConfirmModal(false)}
                />
            )}
            
            <ToastContainer />
        </div>
    );
};

export default TradingView; 