import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { wsService } from '../services/websocket';
import { setPlayerInfo, setError, leaveRoom } from './slice';
import styles from './RoomManager.module.css';

const RoomManager = ({ gameType }) => {
  const dispatch = useDispatch();
  const { isConnected, roomId, playerName, error } = useSelector(state => state.multiplayer);
  const [inputName, setInputName] = useState(playerName || '');
  const [inputRoomId, setInputRoomId] = useState('');

  const handleCreateRoom = () => {
    if (!inputName.trim()) {
      dispatch(setError('Please enter your name'));
      return;
    }

    const playerId = Math.random().toString(36).substr(2, 9);
    dispatch(setPlayerInfo({ playerId, playerName: inputName.trim() }));

    wsService.send('createRoom', {
      gameType,
      playerId,
      playerName: inputName.trim()
    });
  };

  const handleJoinRoom = () => {
    if (!inputName.trim() || !inputRoomId.trim()) {
      dispatch(setError('Please enter your name and room ID'));
      return;
    }

    const playerId = Math.random().toString(36).substr(2, 9);
    dispatch(setPlayerInfo({ playerId, playerName: inputName.trim() }));

    wsService.send('joinRoom', {
      roomId: inputRoomId.trim(),
      playerId,
      playerName: inputName.trim()
    });
  };

  if (roomId) {
    return (
      <div className={styles.roomInfo}>
        <h3>Room: {roomId}</h3>
        <p>Waiting for opponent...</p>
        <button onClick={() => dispatch(leaveRoom())}>Leave Room</button>
      </div>
    );
  }

  return (
    <div className={styles.roomManager}>
      <h3>Multiplayer Setup</h3>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.inputGroup}>
        <label>Your Name:</label>
        <input
          type="text"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>

      <div className={styles.actions}>
        <button
          onClick={handleCreateRoom}
          disabled={!isConnected}
        >
          Create Room
        </button>

        <div className={styles.joinSection}>
          <input
            type="text"
            value={inputRoomId}
            onChange={(e) => setInputRoomId(e.target.value)}
            placeholder="Room ID"
          />
          <button
            onClick={handleJoinRoom}
            disabled={!isConnected}
          >
            Join Room
          </button>
        </div>
      </div>

      {!isConnected && (
        <p className={styles.connectionStatus}>
          Connecting to server...
        </p>
      )}
    </div>
  );
};

RoomManager.propTypes = {
  gameType: PropTypes.string.isRequired,
};

export default RoomManager;
