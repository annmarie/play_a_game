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
  return ALLOWED_ORIGINS.includes(origin);
}

const server = http.createServer();
const wss = new WebSocket.Server({
  server,
  verifyClient: (info) => {
    return info.origin && isOriginAllowed(info.origin);
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

  // Verify origin before proceeding
  if (!isOriginAllowed(req.headers.origin)) {
    ws.close(1008, 'Origin not allowed');
    return;
  }

  // Generate session ID and CSRF token
  const sessionId = crypto.randomUUID();
  const csrfToken = csrfProtection.generateToken(sessionId);

  // Store session info
  ws.sessionId = sessionId;
  ws.origin = req.headers.origin;
  sessions.set(sessionId, { ws, authenticated: false });

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
      const data = JSON.parse(message);

      // Validate CSRF token for all messages before processing
      if (!data.csrfToken || !csrfProtection.validateToken(ws.sessionId, data.csrfToken)) {
        ws.close(1008, 'Invalid CSRF token');
        return;
      }

      if (data.type === 'HANDSHAKE') {
        handleHandshake(ws, data);
        return;
      }

      handleMessage(ws, data);
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.send(JSON.stringify({ type: MESSAGE_TYPES.ERROR, payload: { message: ERROR_MESSAGES.INVALID_FORMAT } }));
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
  if (session) {
    session.authenticated = true;
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'HANDSHAKE_ACK', payload: { success: true } }));
    }
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

  // Validate message structure
  if (!type || payload === undefined || typeof type !== 'string') {
    ws.send(JSON.stringify({ type: MESSAGE_TYPES.ERROR, payload: { message: ERROR_MESSAGES.INVALID_FORMAT } }));
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
      ws.send(JSON.stringify({ type: MESSAGE_TYPES.ERROR, payload: { message: ERROR_MESSAGES.UNKNOWN_TYPE } }));
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
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
}).on('error', (error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});

module.exports = { server, wss };
