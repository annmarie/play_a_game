const WebSocket = require('ws');
const http = require('http');
const crypto = require('crypto');
const { MESSAGE_TYPES, ERROR_MESSAGES, DEFAULT_PORT } = require('./globals');
const CSRFProtection = require('./csrf-protection');
const { handleMessage, handleDisconnect } = require('./message-handlers');

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) ||
  ['http://localhost:5173', 'http://localhost:3000'];

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'"
};

const isOriginAllowed = (origin) => origin && ALLOWED_ORIGINS.includes(origin);

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/api/csrf-token') {
    const origin = req.headers.origin;
    if (!isOriginAllowed(origin)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Origin not allowed' }));
      return;
    }

    const sessionId = crypto.randomUUID();
    const token = csrfProtection.generateToken(sessionId);

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Set-Cookie': `sessionId=${sessionId}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`,
      ...SECURITY_HEADERS
    });
    res.end(JSON.stringify({ token, sessionId }));
    return;
  }

  res.writeHead(426, {
    'Upgrade': 'websocket',
    'Connection': 'Upgrade',
    ...SECURITY_HEADERS
  });
  res.end('WebSocket connection required');
});

const wss = new WebSocket.Server({
  server,
  verifyClient: (info) => {
    const origin = info.origin || info.req.headers.origin;
    return isOriginAllowed(origin);
  }
});

const csrfProtection = new CSRFProtection();
const sessions = new Map();

const sendError = (ws, message) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: MESSAGE_TYPES.ERROR, payload: { message } }));
  }
};

const closeWithError = (ws, code, reason) => {
  console.warn(reason);
  ws.close(code, reason);
};

wss.on('connection', (ws, req) => {
  const origin = req.headers.origin;
  if (!isOriginAllowed(origin)) {
    return closeWithError(ws, 1008, 'Origin not allowed');
  }

  const sessionId = crypto.randomUUID();
  const csrfToken = csrfProtection.generateToken(sessionId);

  ws.sessionId = sessionId;
  ws.origin = origin;
  ws.lastMessageTime = 0;

  sessions.set(sessionId, {
    ws,
    authenticated: false,
    origin,
    createdAt: Date.now()
  });

  ws.send(JSON.stringify({
    type: 'CSRF_TOKEN',
    payload: { token: csrfToken, sessionId }
  }));

  ws.on('message', (message) => {
    try {
      // Validate session and origin
      const session = sessions.get(ws.sessionId);
      if (!session || session.origin !== ws.origin) {
        return closeWithError(ws, 1008, 'Origin validation failed');
      }

      const now = Date.now();
      if (now - ws.lastMessageTime < 50) {
        return closeWithError(ws, 1008, 'Rate limit exceeded');
      }
      ws.lastMessageTime = now;

      const data = JSON.parse(message);

      // CSRF Protection: Validate token format and authenticity
      if (!data?.csrfToken || typeof data.csrfToken !== 'string' ||
          !csrfProtection.validateToken(ws.sessionId, data.csrfToken)) {
        return closeWithError(ws, 1008, 'CSRF token validation failed');
      }

      if (!session || session.ws !== ws) {
        return closeWithError(ws, 1008, 'Invalid session');
      }

      if (data.type === 'HANDSHAKE') {
        session.authenticated = true;
        ws.send(JSON.stringify({ type: 'HANDSHAKE_ACK', payload: { success: true } }));
        return;
      }

      if (!session.authenticated) {
        return closeWithError(ws, 1008, 'Authentication required');
      }

      handleMessage(ws, data);
    } catch (error) {
      console.error('Message error:', error);
      sendError(ws, ERROR_MESSAGES.INVALID_FORMAT);
    }
  });

  ws.on('close', () => {
    handleDisconnect(ws);
    sessions.delete(ws.sessionId);
    csrfProtection.revokeToken(ws.sessionId);
  });

  ws.on('error', console.error);
});

// Start the server
const PORT = process.env.PORT || DEFAULT_PORT;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

module.exports = { server, wss };
