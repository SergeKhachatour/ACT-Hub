import { toast } from 'react-toastify';

class WebSocketService {
    constructor() {
        this.ws = null;
        this.subscribers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.alertHandlers = new Set();
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(process.env.REACT_APP_WS_URL);

                this.ws.onopen = () => {
                    console.log('WebSocket connected');
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.handleReconnect();
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };
            } catch (error) {
                console.error('Error creating WebSocket:', error);
                reject(error);
            }
        });
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
            setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    subscribe(channel, callback) {
        if (!this.subscribers.has(channel)) {
            this.subscribers.set(channel, new Set());
        }
        this.subscribers.get(channel).add(callback);

        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'subscribe', channel }));
        }

        return () => this.unsubscribe(channel, callback);
    }

    unsubscribe(channel, callback) {
        const channelSubscribers = this.subscribers.get(channel);
        if (channelSubscribers) {
            channelSubscribers.delete(callback);
            if (channelSubscribers.size === 0) {
                this.subscribers.delete(channel);
                if (this.ws?.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({ type: 'unsubscribe', channel }));
                }
            }
        }
    }

    handleMessage(data) {
        const { type, channel, payload } = data;

        if (type === 'PRICE_ALERT') {
            this.alertHandlers.forEach(handler => handler(payload));
            return;
        }

        const subscribers = this.subscribers.get(channel);
        if (subscribers) {
            subscribers.forEach(callback => callback(payload));
        }
    }

    subscribeToAlerts(handler) {
        this.alertHandlers.add(handler);
        return () => this.alertHandlers.delete(handler);
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.subscribers.clear();
    }

    handleAlert(message) {
        toast.info(message, {
            position: "top-right",
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
        });
    }
}

export const wsService = new WebSocketService(); 