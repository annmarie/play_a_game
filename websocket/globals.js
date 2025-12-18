const MESSAGE_TYPES = {
  CREATE_ROOM: 'createRoom',
  JOIN_ROOM: 'joinRoom',
  LEAVE_ROOM: 'leaveRoom',
  GAME_MOVE: 'gameMove',
  ROOM_CREATED: 'roomCreated',
  ROOM_JOINED: 'roomJoined',
  OPPONENT_JOINED: 'opponentJoined',
  OPPONENT_LEFT: 'opponentLeft',
  ERROR: 'error'
};

const ERROR_MESSAGES = {
  INVALID_FORMAT: 'Invalid message format',
  UNKNOWN_TYPE: 'Unknown message type',
  ROOM_NOT_FOUND: 'Room not found',
  ROOM_FULL: 'Room is full'
};

const DEFAULT_PORT = 8080;
const ROOM_ID_LENGTH = 6;

module.exports = {
  MESSAGE_TYPES,
  ERROR_MESSAGES,
  DEFAULT_PORT,
  ROOM_ID_LENGTH
};
