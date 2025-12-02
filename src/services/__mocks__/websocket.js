class MockWebSocketService {
  constructor() {
    this.listeners = new Map();
    this.isConnected = false;
  }

  connect() {
    this.isConnected = true;
    setTimeout(() => this.emit('connected'), 0);
  }

  send(type, payload) {
    // Mock implementation - could emit events for testing
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
    this.isConnected = false;
  }
}

export const wsService = new MockWebSocketService();
