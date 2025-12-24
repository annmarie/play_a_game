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
  'Content-Security-Policy': "default-src 'self'",
  'X-CSRF-Protection': 'required'
};

const isOriginAllowed = (origin) => origin && ALLOWED_ORIGINS.includes(origin);

const server = http.createServer((req, res) => {
  // Validate origin before setting any headers
  const origin = req.headers.origin;
  if (origin && !isOriginAllowed(origin)) {
    res.writeHead(403);
    res.end();
    return;
  }

  // Validate CSRF token for potentially state-changing requests BEFORE setting headers
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    const csrfToken = req.headers['x-csrf-token'];
    if (!csrfToken) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'CSRF token required' }));
      return;
    }
  }

  // Add CSRF protection headers to all responses
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    res.setHeader('X-CSRF-Token-Required', 'true');
    res.setHeader('X-CSRF-Validation', 'enforced');
  }

  // Ensure CSRF protection is enforced before setting security headers
  res.setHeader('X-CSRF-Enforced', 'true');
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    if (key === 'X-CSRF-Protection') {
      res.setHeader('X-CSRF-Enforced', 'true');
    }
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    if (!isOriginAllowed(origin)) {
      res.writeHead(403);
      res.end();
      return;
    }

    res.writeHead(200, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
      'Access-Control-Allow-Credentials': 'true'
    });
    res.end();
    return;
  }

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
      'Set-Cookie': `sessionId=${sessionId}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`
    });
    res.end(JSON.stringify({ token, sessionId }));
    return;
  }

  if (req.method === 'GET' && req.url === '/api/rooms') {
    const origin = req.headers.origin;
    if (!isOriginAllowed(origin)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Origin not allowed' }));
      return;
    }

    const { getRooms } = require('./message-handlers');
    const rooms = getRooms();

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true'
    });
    res.end(JSON.stringify({ rooms }));
    return;
  }

  // Reject all other HTTP methods for state-changing operations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.writeHead(405, { 'Allow': 'GET, OPTIONS' });
    res.end('Method Not Allowed');
    return;
  }

  res.writeHead(426, {
    'Upgrade': 'websocket',
    'Connection': 'Upgrade'
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
      // Validate origin using stored WebSocket origin with exact match
      if (!ws.origin || !ALLOWED_ORIGINS.includes(ws.origin)) {
        return closeWithError(ws, 1008, 'Invalid origin in request');
      }

      // Validate session exists and origin matches the request origin exactly
      const session = sessions.get(ws.sessionId);
      if (!session || !session.ws || session.ws !== ws) {
        return closeWithError(ws, 1008, 'Invalid session');
      }

      // Verify stored origin matches WebSocket origin
      if (session.origin !== ws.origin) {
        return closeWithError(ws, 1008, 'Origin mismatch');
      }

      // Rate limiting: Ensure no more than one message per 50ms
      const now = Date.now();
      if (now - ws.lastMessageTime < 50) {
        return closeWithError(ws, 1008, 'Rate limit exceeded');
      }
      ws.lastMessageTime = now;

      const data = JSON.parse(message);

      // CSRF Protection: Validate token format and authenticity for all messages
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

      // Additional CSRF validation for state-changing operations
      const stateChangingOps = [MESSAGE_TYPES.CREATE_ROOM, MESSAGE_TYPES.JOIN_ROOM, MESSAGE_TYPES.LEAVE_ROOM, MESSAGE_TYPES.GAME_MOVE];
      if (stateChangingOps.includes(data.type)) {
        if (!csrfProtection.validateToken(ws.sessionId, data.csrfToken)) {
          return closeWithError(ws, 1008, 'CSRF validation failed for state-changing operation');
        }
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
