import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { wsService } from '../services/websocket';
import { setPlayerInfo, setError, leaveRoom } from './slice';
import { BUTTON_TEXT, LABELS, PLACEHOLDERS, ERROR_MESSAGES } from './globals';
import styles from './RoomManager.module.css';

const RoomManager = ({ gameType }) => {
  const dispatch = useDispatch();
  const { isConnected, roomId, playerName, error } = useSelector(state => state.multiplayer);
  const [inputName, setInputName] = useState(playerName || '');
  const [inputRoomId, setInputRoomId] = useState('');

  const handleCreateRoom = () => {
    if (!inputName.trim()) {
      dispatch(setError(ERROR_MESSAGES.ENTER_NAME));
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
      dispatch(setError(ERROR_MESSAGES.ENTER_NAME_AND_ROOM));
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
        <p>{LABELS.WAITING_FOR_OPPONENT}</p>
        <button onClick={() => dispatch(leaveRoom())}>{BUTTON_TEXT.LEAVE_ROOM}</button>
      </div>
    );
  }

  return (
    <div className={styles.roomManager}>
      <h3>{LABELS.MULTIPLAYER_SETUP}</h3>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.inputGroup}>
        <label>{LABELS.YOUR_NAME}</label>
        <input
          type="text"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          placeholder={PLACEHOLDERS.ENTER_NAME}
        />
      </div>

      <div className={styles.actions}>
        <button
          onClick={handleCreateRoom}
          disabled={!isConnected}
        >
          {BUTTON_TEXT.CREATE_ROOM}
        </button>

        <div className={styles.joinSection}>
          <input
            type="text"
            value={inputRoomId}
            onChange={(e) => setInputRoomId(e.target.value)}
            placeholder={PLACEHOLDERS.ROOM_ID}
          />
          <button
            onClick={handleJoinRoom}
            disabled={!isConnected}
          >
            {BUTTON_TEXT.JOIN_ROOM}
          </button>
        </div>
      </div>

      {!isConnected && (
        <p className={styles.connectionStatus}>
          {LABELS.CONNECTING}
        </p>
      )}
    </div>
  );
};

RoomManager.propTypes = {
  gameType: PropTypes.string.isRequired,
};

export default RoomManager;
