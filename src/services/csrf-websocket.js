class CSRFWebSocketClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.csrfToken = null;
    this.sessionId = null;
    this.authenticated = false;
    this.messageQueue = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'CSRF_TOKEN') {
          this.csrfToken = data.payload.token;
          this.sessionId = data.payload.sessionId;
          this.performHandshake().then(resolve).catch(reject);
        } else if (data.type === 'HANDSHAKE_ACK') {
          this.authenticated = true;
          this.processMessageQueue();
        } else {
          this.onMessage(data);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.authenticated = false;
        this.csrfToken = null;
        if (this.onClose) this.onClose();
      };
    });
  }

  performHandshake() {
    return new Promise((resolve, reject) => {
      if (!this.csrfToken) {
        reject(new Error('No CSRF token received'));
        return;
      }

      const handshakeMessage = {
        type: 'HANDSHAKE',
        payload: { sessionId: this.sessionId },
        csrfToken: this.csrfToken
      };

      this.ws.send(JSON.stringify(handshakeMessage));

      setTimeout(() => {
        if (this.authenticated) {
          resolve();
        } else {
          reject(new Error('Handshake failed'));
        }
      }, 5000);
    });
  }

  send(type, payload) {
    const message = {
      type,
      payload,
      csrfToken: this.csrfToken
    };

    if (this.authenticated && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  processMessageQueue() {
    while (this.messageQueue.length > 0 && this.ws.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      this.ws.send(JSON.stringify(message));
    }
  }

  onMessage() {
    // Override this method
  }

  onClose() {
    // Override this method
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export default CSRFWebSocketClient;