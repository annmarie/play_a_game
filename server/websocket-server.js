const WebSocket = require('ws');
const http = require('http');
const { MESSAGE_TYPES, ERROR_MESSAGES, DEFAULT_PORT, ROOM_ID_LENGTH } = require('./globals');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const rooms = new Map();
const players = new Map();

function generateRoomId() {
  return Math.random().toString(36).substr(2, ROOM_ID_LENGTH).toUpperCase();
}

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(ws, data);
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.send(JSON.stringify({ type: MESSAGE_TYPES.ERROR, payload: { message: ERROR_MESSAGES.INVALID_FORMAT } }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    handleDisconnect(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function handleMessage(ws, data) {
  const { type, payload } = data;

  switch (type) {
    case MESSAGE_TYPES.CREATE_ROOM:
      handleCreateRoom(ws, payload);
      break;
    case MESSAGE_TYPES.JOIN_ROOM:
      handleJoinRoom(ws, payload);
      break;
    case MESSAGE_TYPES.LEAVE_ROOM:
      handleLeaveRoom(ws, payload);
      break;
    case MESSAGE_TYPES.GAME_MOVE:
      handleGameMove(ws, payload);
      break;
    default:
      ws.send(JSON.stringify({ type: MESSAGE_TYPES.ERROR, payload: { message: ERROR_MESSAGES.UNKNOWN_TYPE } }));
  }
}

function handleCreateRoom(ws, payload) {
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

  ws.send(JSON.stringify({
    type: MESSAGE_TYPES.ROOM_CREATED,
    payload: { roomId, isHost: true }
  }));

  console.log(`Room ${roomId} created by ${playerName}`);
}

function handleJoinRoom(ws, payload) {
  const { roomId, playerId, playerName } = payload;
  const room = rooms.get(roomId);

  if (!room) {
    ws.send(JSON.stringify({
      type: MESSAGE_TYPES.ERROR,
      payload: { message: ERROR_MESSAGES.ROOM_NOT_FOUND }
    }));
    return;
  }

  if (room.guest) {
    ws.send(JSON.stringify({
      type: MESSAGE_TYPES.ERROR,
      payload: { message: ERROR_MESSAGES.ROOM_FULL }
    }));
    return;
  }

  room.guest = { ws, playerId, playerName };
  players.set(ws, { playerId, roomId, isHost: false });

  // Notify guest
  ws.send(JSON.stringify({
    type: MESSAGE_TYPES.ROOM_JOINED,
    payload: {
      roomId,
      isHost: false,
      opponent: { name: room.host.playerName, id: room.host.playerId }
    }
  }));

  // Notify host
  room.host.ws.send(JSON.stringify({
    type: MESSAGE_TYPES.OPPONENT_JOINED,
    payload: {
      opponent: { name: playerName, id: playerId }
    }
  }));

  console.log(`${playerName} joined room ${roomId}`);
}

function handleLeaveRoom(ws, payload) {
  const player = players.get(ws);
  if (!player) return;

  const room = rooms.get(player.roomId);
  if (!room) return;

  // Notify the other player
  const otherPlayer = player.isHost ? room.guest : room.host;
  if (otherPlayer) {
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
  const player = players.get(ws);
  if (!player) return;

  const room = rooms.get(player.roomId);
  if (!room) return;

  const opponent = player.isHost ? room.guest : room.host;
  if (!opponent) return;

  // Forward the move to the opponent
  opponent.ws.send(JSON.stringify({
    type: MESSAGE_TYPES.GAME_MOVE,
    payload: payload
  }));

  // Update room game state
  room.gameState = payload.gameState;
}

function handleDisconnect(ws) {
  const player = players.get(ws);
  if (player) {
    handleLeaveRoom(ws, { roomId: player.roomId });
  }
}

const PORT = process.env.PORT || DEFAULT_PORT;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

module.exports = { server, wss };
