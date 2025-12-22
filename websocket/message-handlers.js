const WebSocket = require('ws');
const { MESSAGE_TYPES, ERROR_MESSAGES, ROOM_ID_LENGTH } = require('./globals');

const rooms = new Map();
const players = new Map();

/**
 * Generates a unique room ID for multiplayer games
 * @returns {string} A unique 6-character uppercase room ID (e.g., "A7X9K2")
 */
const generateRoomId = () => {
  let roomId;
  do {
    roomId = Math.random().toString(36).slice(2, 2 + ROOM_ID_LENGTH).toUpperCase();
  } while (rooms.has(roomId));
  return roomId;
};

/**
 * Sends an error message to a WebSocket client
 * @param {WebSocket} ws - The WebSocket connection
 * @param {string} message - The error message to send
 */
const sendError = (ws, message) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: MESSAGE_TYPES.ERROR, payload: { message } }));
  }
};

/**
 * Routes incoming WebSocket messages to appropriate handlers
 * @param {WebSocket} ws - The WebSocket connection
 * @param {Object} data - The decoded message data
 * @param {string} data.type - The message type
 * @param {Object} data.payload - The message payload
 */
function handleMessage(ws, data) {
  const { type, payload } = data;

  if (!type || !payload || typeof type !== 'string') {
    return sendError(ws, ERROR_MESSAGES.INVALID_FORMAT);
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
      sendError(ws, ERROR_MESSAGES.UNKNOWN_TYPE);
  }
}

/**
 * Creates a new game room with the requesting player as host
 * @param {WebSocket} ws - The WebSocket connection of the host
 * @param {Object} payload - The room creation data
 * @param {string} payload.gameType - The type of game to create
 * @param {string} payload.playerId - Unique identifier for the player
 * @param {string} payload.playerName - Display name for the player
 */
function handleCreateRoom(ws, payload) {
  const { gameType, playerId, playerName } = payload;

  if (!gameType?.trim() || !playerId?.trim() || !playerName?.trim()) {
    return sendError(ws, ERROR_MESSAGES.INVALID_FORMAT);
  }

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
}

/**
 * Allows a player to join an existing game room
 * @param {WebSocket} ws - The WebSocket connection of the joining player
 * @param {Object} payload - The join room data
 * @param {string} payload.roomId - The room ID to join
 * @param {string} payload.playerId - Unique identifier for the player
 * @param {string} payload.playerName - Display name for the player
 */
function handleJoinRoom(ws, payload) {
  const { roomId, playerId, playerName } = payload;

  if (!roomId?.trim() || !playerId?.trim() || !playerName?.trim()) {
    return sendError(ws, ERROR_MESSAGES.INVALID_FORMAT);
  }

  const room = rooms.get(roomId);
  if (!room) {
    return sendError(ws, ERROR_MESSAGES.ROOM_NOT_FOUND);
  }
  if (room.guest) {
    return sendError(ws, ERROR_MESSAGES.ROOM_FULL);
  }

  room.guest = { ws, playerId, playerName };
  players.set(ws, { playerId, roomId, isHost: false });

  const responsePayload = {
    roomId,
    isHost: false,
    opponent: { name: room.host.playerName, id: room.host.playerId },
    gameState: room.gameState
  };

  ws.send(JSON.stringify({
    type: MESSAGE_TYPES.ROOM_JOINED,
    payload: responsePayload
  }));

  room.host.ws.send(JSON.stringify({
    type: MESSAGE_TYPES.OPPONENT_JOINED,
    payload: { opponent: { name: playerName, id: playerId } }
  }));
}

/**
 * Removes a player from their current room and notifies opponent
 * @param {WebSocket} ws - The WebSocket connection of the leaving player
 */
function handleLeaveRoom(ws) {
  const player = players.get(ws);
  if (!player) return;

  const room = rooms.get(player.roomId);
  if (!room) return;

  const opponent = player.isHost ? room.guest : room.host;
  if (opponent?.ws.readyState === WebSocket.OPEN) {
    opponent.ws.send(JSON.stringify({
      type: MESSAGE_TYPES.OPPONENT_LEFT,
      payload: {}
    }));
  }

  players.delete(ws);
  if (player.isHost) {
    rooms.delete(player.roomId);
  } else {
    room.guest = null;
  }
}

/**
 * Forwards game moves between players in the same room
 * @param {WebSocket} ws - The WebSocket connection of the player making the move
 * @param {Object} payload - The game move data
 * @param {Object} [payload.gameState] - Optional updated game state
 */
function handleGameMove(ws, payload) {
  const player = players.get(ws);
  const room = rooms.get(player?.roomId);
  const opponent = player?.isHost ? room?.guest : room?.host;

  if (opponent?.ws.readyState === WebSocket.OPEN) {
    opponent.ws.send(JSON.stringify({
      type: MESSAGE_TYPES.GAME_MOVE,
      payload
    }));
  }

  if (payload.gameState && room) {
    room.gameState = payload.gameState;
  }
}

/**
 * Handles player disconnection by cleaning up their room and notifying opponent
 * @param {WebSocket} ws - The WebSocket connection that disconnected
 */
function handleDisconnect(ws) {
  const player = players.get(ws);
  if (player) {
    handleLeaveRoom(ws);
  }
}

module.exports = {
  handleMessage,
  handleDisconnect
};
