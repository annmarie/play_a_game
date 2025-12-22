import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { wsService } from '@services/websocket';
import { localStorageService } from '@services/localStorage';
import { setPlayerInfo, setError, leaveRoom } from './slice';
import { setName } from '@/slice';
import { BUTTON_TEXT, LABELS, PLACEHOLDERS, ERROR_MESSAGES } from './globals';
import styles from './MultiplayerSetup.module.css';

const MultiplayerSetup = ({ gameType }) => {
  const dispatch = useDispatch();
  const { isConnected, roomId, playerName, error } = useSelector(state => state.multiplayer);
  const storedName = useSelector(state => state.main.name);
  const [inputName, setInputName] = useState(playerName || '');
  const [inputRoomId, setInputRoomId] = useState('');

  const handleRoomAction = (action, roomId = null) => {
    const name = storedName || inputName.trim();
    const room = roomId?.trim();

    if (!name || (action === 'joinRoom' && !room)) {
      dispatch(setError(action === 'joinRoom' ? ERROR_MESSAGES.ENTER_NAME_AND_ROOM : ERROR_MESSAGES.ENTER_NAME));
      return;
    }

    // Save name to storage if entered in this form
    if (!storedName && inputName.trim()) {
      dispatch(setName(inputName.trim()));
    }

    const playerId = Math.random().toString(36).substr(2, 9);
    dispatch(setPlayerInfo({ playerId, playerName: name }));

    wsService.send(action, {
      gameType,
      playerId,
      playerName: name,
      ...(room && { roomId: room })
    });
  };

  if (roomId) {
    return (
      <div className={styles.setupInfo}>
        <h3>Room: {roomId}</h3>
        <p>{LABELS.WAITING_FOR_OPPONENT}</p>
        <button onClick={() => dispatch(leaveRoom())}>{BUTTON_TEXT.LEAVE_ROOM}</button>
      </div>
    );
  }

  return (
    <div className={styles.multiplayerSetup}>
      <h3>{LABELS.MULTIPLAYER_SETUP}</h3>

      {error && <div className={styles.error}>{error}</div>}

      {storedName ? (
        <div className={styles.nameDisplay}>
          <label>{LABELS.YOUR_NAME}</label>
          <p className={styles.storedName}>{storedName}</p>
        </div>
      ) : (
        <div className={styles.inputGroup}>
          <label>{LABELS.YOUR_NAME}</label>
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder={PLACEHOLDERS.ENTER_NAME}
          />
        </div>
      )}

      <div className={styles.actions}>
        <button
          onClick={() => handleRoomAction('createRoom')}
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
            onClick={() => handleRoomAction('joinRoom', inputRoomId)}
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

MultiplayerSetup.propTypes = {
  gameType: PropTypes.string.isRequired,
};

export default MultiplayerSetup;
