import CSRFWebSocketClient from './csrf-websocket.js';

class WebSocketService {
  constructor() {
    this.csrfClient = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async connect(url = 'ws://localhost:8080') {
    try {
      const allowedHosts = ['localhost', '127.0.0.1'];
      const urlObj = new URL(url);
      if (!allowedHosts.includes(urlObj.hostname)) {
        throw new Error('Connection to this host is not allowed');
      }

      this.csrfClient = new CSRFWebSocketClient(urlObj.href);
      this.csrfClient.onMessage = (data) => {
        if (typeof data.type === 'string' && data.payload !== undefined) {
          this.emit(data.type, data.payload);
        }
      };

      this.csrfClient.onClose = () => {
        this.emit('disconnected');
        this.attemptReconnect();
      };

      await this.csrfClient.connect();
      this.reconnectAttempts = 0;
      this.emit('connected');
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.emit('error', { message: 'Failed to establish WebSocket connection' });
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect();
      }, 2000 * this.reconnectAttempts);
    }
  }

  send(type, payload) {
    if (this.csrfClient && this.csrfClient.authenticated) {
      const message = { ...payload, timestamp: Date.now() };
      this.csrfClient.send(type, message);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.csrfClient) {
      this.csrfClient.close();
      this.csrfClient = null;
    }
  }
}

export const wsService = new WebSocketService();
