const WebSocket = require('ws');
const http = require('http');
const crypto = require('crypto');
const { MESSAGE_TYPES, ERROR_MESSAGES, DEFAULT_PORT, ROOM_ID_LENGTH } = require('./globals');
const CSRFProtection = require('./csrf-protection');

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

function isOriginAllowed(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(allowed => origin === allowed);
}

const server = http.createServer((req, res) => {
  // Reject all HTTP requests - only WebSocket connections allowed
  res.writeHead(426, {
    'Content-Type': 'text/plain',
    'Upgrade': 'websocket',
    'Connection': 'Upgrade'
  });
  res.end('WebSocket connection required');
});
const wss = new WebSocket.Server({
  server,
  verifyClient: (info) => {
    // Strict origin validation
    const origin = info.origin || info.req.headers.origin;
    if (!origin) {
      console.warn('Connection rejected: No origin header');
      return false;
    }
    if (!isOriginAllowed(origin)) {
      console.warn(`Connection rejected: Invalid origin ${origin}`);
      return false;
    }
    return true;
  }
});

const rooms = new Map();
const players = new Map();
const csrfProtection = new CSRFProtection();
const sessions = new Map(); // Track WebSocket sessions

function generateRoomId() {
  let roomId;
  do {
    roomId = Math.random().toString(36).slice(2, 2 + ROOM_ID_LENGTH).toUpperCase();
  } while (rooms.has(roomId));
  return roomId;
}

wss.on('connection', (ws, req) => {
  console.log('New client connected');

  // Double-check origin validation
  const origin = req.headers.origin;
  if (!origin || !isOriginAllowed(origin)) {
    console.warn(`Connection rejected in handler: Invalid origin ${origin}`);
    ws.close(1008, 'Origin not allowed');
    return;
  }

  // Generate session ID and CSRF token
  const sessionId = crypto.randomUUID();
  const csrfToken = csrfProtection.generateToken(sessionId);

  // Store session info with origin binding
  ws.sessionId = sessionId;
  ws.origin = req.headers.origin;
  sessions.set(sessionId, { ws, authenticated: false, origin: req.headers.origin, createdAt: Date.now() });

  // Send CSRF token to client with additional security headers
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'CSRF_TOKEN',
      payload: { token: csrfToken, sessionId },
      timestamp: Date.now()
    }));
  }

  ws.on('message', (message) => {
    try {
      // Comprehensive origin validation on every message
      if (!ws.origin || !isOriginAllowed(ws.origin)) {
        console.warn(`Message rejected: Invalid stored origin ${ws.origin}`);
        ws.close(1008, 'Origin validation failed');
        return;
      }

      // Additional origin integrity check
      const session = sessions.get(ws.sessionId);
      if (!session || session.origin !== ws.origin) {
        console.warn(`Origin mismatch detected for session ${ws.sessionId}`);
        ws.close(1008, 'Origin integrity violation');
        return;
      }

      // Rate limiting check
      const now = Date.now();
      if (!ws.lastMessageTime) ws.lastMessageTime = 0;
      if (now - ws.lastMessageTime < 50) {
        console.warn(`Rate limit exceeded for ${ws.sessionId}`);
        ws.close(1008, 'Rate limit exceeded');
        return;
      }
      ws.lastMessageTime = now;

      const data = JSON.parse(message);

      // Comprehensive CSRF validation
      if (!data || typeof data !== 'object') {
        console.warn(`Invalid message structure from ${ws.sessionId}`);
        ws.close(1008, 'Invalid message structure');
        return;
      }

      if (!data.csrfToken || typeof data.csrfToken !== 'string' || data.csrfToken.length > 256) {
        console.warn(`Invalid CSRF token format from ${ws.sessionId}`);
        ws.close(1008, 'Invalid CSRF token format');
        return;
      }

      // Validate CSRF token with session binding
      const session = sessions.get(ws.sessionId);
      if (!session || session.ws !== ws) {
        console.warn(`Session validation failed for ${ws.sessionId}`);
        ws.close(1008, 'Invalid session');
        return;
      }

      if (!csrfProtection.validateToken(ws.sessionId, data.csrfToken)) {
        console.warn(`CSRF validation failed for ${ws.sessionId}`);
        ws.close(1008, 'Invalid CSRF token');
        return;
      }

      // Enhanced CSRF protection for state-changing operations
      const stateChangingTypes = [MESSAGE_TYPES.CREATE_ROOM, MESSAGE_TYPES.JOIN_ROOM, MESSAGE_TYPES.LEAVE_ROOM, MESSAGE_TYPES.GAME_MOVE];
      if (stateChangingTypes.includes(data.type)) {
        if (!session.authenticated) {
          console.warn(`Unauthenticated state change attempt from ${ws.sessionId}`);
          ws.close(1008, 'Authentication required');
          return;
        }

        // Additional CSRF validation for critical operations
        if (!data.timestamp || Math.abs(Date.now() - data.timestamp) > 300000) {
          console.warn(`Expired request from ${ws.sessionId}`);
          ws.close(1008, 'Request expired');
          return;
        }

        // Session age validation
        if (Date.now() - session.createdAt > 3600000) {
          console.warn(`Session expired for ${ws.sessionId}`);
          ws.close(1008, 'Session expired');
          return;
        }
      }

      if (data.type === 'HANDSHAKE') {
        // CSRF validation required for handshake
        if (!csrfProtection.validateToken(ws.sessionId, data.csrfToken)) {
          console.warn(`CSRF validation failed for handshake from ${ws.sessionId}`);
          ws.close(1008, 'Invalid CSRF token');
          return;
        }
        handleHandshake(ws, data);
        return;
      }

      handleMessage(ws, data);
    } catch (error) {
      console.error('Error parsing message:', error);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: MESSAGE_TYPES.ERROR, payload: { message: ERROR_MESSAGES.INVALID_FORMAT } }));
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    handleDisconnect(ws);
    if (ws.sessionId) {
      sessions.delete(ws.sessionId);
      csrfProtection.revokeToken(ws.sessionId);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function handleHandshake(ws, data) {
  const session = sessions.get(ws.sessionId);
  if (!session) {
    ws.close(1008, 'Invalid session');
    return;
  }

  // CSRF token already validated before this function is called
  session.authenticated = true;
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'HANDSHAKE_ACK', payload: { success: true } }));
  }
}

function handleMessage(ws, data) {
  const { type, payload } = data;
  const session = sessions.get(ws.sessionId);

  // Check if session is authenticated
  if (!session || !session.authenticated) {
    ws.close(1008, 'Session not authenticated');
    return;
  }

  // Enhanced message validation
  if (!type || payload === undefined || typeof type !== 'string' || type.length > 50) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: MESSAGE_TYPES.ERROR, payload: { message: ERROR_MESSAGES.INVALID_FORMAT } }));
    }
    return;
  }

  switch (type) {
    case MESSAGE_TYPES.CREATE_ROOM:
      handleCreateRoom(ws, payload);
      break;
    case MESSAGE_TYPES.JOIN_ROOM:
      handleJoinRoom(ws, payload);
      break;
    case MESSAGE_TYPES.LEAVE_ROOM:
      handleLeaveRoom(ws);
      break;
    case MESSAGE_TYPES.GAME_MOVE:
      handleGameMove(ws, payload);
      break;
    default:
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: MESSAGE_TYPES.ERROR, payload: { message: ERROR_MESSAGES.UNKNOWN_TYPE } }));
      }
  }
}

function handleCreateRoom(ws, payload) {
  if (!payload || typeof payload !== 'object' ||
      typeof payload.gameType !== 'string' || !payload.gameType.trim() ||
      typeof payload.playerId !== 'string' || !payload.playerId.trim() ||
      typeof payload.playerName !== 'string' || !payload.playerName.trim() ||
      payload.playerName.length > 50) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: MESSAGE_TYPES.ERROR, payload: { message: ERROR_MESSAGES.INVALID_FORMAT } }));
    }
    return;
  }

  const { gameType, playerId, playerName } = payload;
  const roomId = generateRoomId();

  const room = {
    id: roomId,
    gameType,
    host: { ws, playerId, playerName },
    guest: null,
    gameState: null
  };

  rooms.set(roomId, room);
  players.set(ws, { playerId, roomId, isHost: true });

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: MESSAGE_TYPES.ROOM_CREATED,
      payload: { roomId, isHost: true }
    }));
  }

  console.log(`Room ${roomId} created by ${playerName}`);
}

function handleJoinRoom(ws, payload) {
  if (!payload || typeof payload !== 'object' ||
      typeof payload.roomId !== 'string' || !payload.roomId.trim() ||
      typeof payload.playerId !== 'string' || !payload.playerId.trim() ||
      typeof payload.playerName !== 'string' || !payload.playerName.trim() ||
      payload.playerName.length > 50) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: MESSAGE_TYPES.ERROR, payload: { message: ERROR_MESSAGES.INVALID_FORMAT } }));
    }
    return;
  }

  const { roomId, playerId, playerName } = payload;
  const room = rooms.get(roomId);

  if (!room) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: MESSAGE_TYPES.ERROR,
        payload: { message: ERROR_MESSAGES.ROOM_NOT_FOUND }
      }));
    }
    return;
  }

  if (room.guest) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: MESSAGE_TYPES.ERROR,
        payload: { message: ERROR_MESSAGES.ROOM_FULL }
      }));
    }
    return;
  }

  room.guest = { ws, playerId, playerName };
  players.set(ws, { playerId, roomId, isHost: false });

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: MESSAGE_TYPES.ROOM_JOINED,
      payload: {
        roomId,
        isHost: false,
        opponent: { name: room.host.playerName, id: room.host.playerId }
      }
    }));
  }

  // Notify host
  if (room.host.ws.readyState === WebSocket.OPEN) {
    room.host.ws.send(JSON.stringify({
      type: MESSAGE_TYPES.OPPONENT_JOINED,
      payload: {
        opponent: { name: playerName, id: playerId }
      }
    }));
  }

  console.log(`${playerName} joined room ${roomId}`);
}

function handleLeaveRoom(ws) {
  const player = players.get(ws);
  if (!player) return;

  const room = rooms.get(player.roomId);
  if (!room) return;

  const otherPlayer = player.isHost ? room.guest : room.host;
  if (otherPlayer && otherPlayer.ws.readyState === WebSocket.OPEN) {
    otherPlayer.ws.send(JSON.stringify({
      type: MESSAGE_TYPES.OPPONENT_LEFT,
      payload: {}
    }));
  }

  // Clean up
  players.delete(ws);
  if (player.isHost) {
    rooms.delete(player.roomId);
  } else {
    room.guest = null;
  }

  console.log(`Player left room ${player.roomId}`);
}

function handleGameMove(ws, payload) {
  if (!payload || typeof payload !== 'object') return;

  const player = players.get(ws);
  if (!player) return;

  const room = rooms.get(player.roomId);
  if (!room) return;

  const opponent = player.isHost ? room.guest : room.host;
  if (!opponent) return;

  if (opponent.ws.readyState === WebSocket.OPEN) {
    opponent.ws.send(JSON.stringify({
      type: MESSAGE_TYPES.GAME_MOVE,
      payload
    }));
  }

  if (payload.gameState) {
    room.gameState = payload.gameState;
  }
}

function handleDisconnect(ws) {
  const player = players.get(ws);
  if (player) {
    handleLeaveRoom(ws);
  }
}

const PORT = process.env.PORT || DEFAULT_PORT;

// Add comprehensive security to HTTP server
server.on('request', (req, res) => {
  // Validate origin for all requests
  const origin = req.headers.origin;
  if (origin && !isOriginAllowed(origin)) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Origin not allowed' }));
    return;
  }

  // Set comprehensive security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");

  // Set secure cookies with SameSite protection
  const cookieOptions = 'HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600';
  res.setHeader('Set-Cookie', [
    `sessionId=; ${cookieOptions}`,
    `csrfToken=; ${cookieOptions}`,
    `gameSession=; ${cookieOptions}`
  ]);
});

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log('HTTP requests will be rejected - WebSocket only');
  console.log('Security headers enabled');
}).on('error', (error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});

module.exports = { server, wss };
