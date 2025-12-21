import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { PLAYERS } from '../../globals';
import { setMultiplayerMode } from '../../slice';
import { leaveRoom } from '../../../MultiplayerSetup/slice';
import { wsService } from '../../../services/websocket';
import styles from './MultiplayerInfo.module.css';

const MultiplayerInfo = ({ multiplayer, myPlayer }) => {
  const dispatch = useDispatch();

  const handleLeaveRoom = () => {
    dispatch(leaveRoom());
    dispatch(setMultiplayerMode({ isMultiplayer: null, myPlayer: null }));
    wsService.send('leaveRoom', { roomId: multiplayer.roomId });
  };

  return (
    <div className={styles.multiplayerInfo}>
      <p>Room: {multiplayer.roomId}</p>
      <p>You: {multiplayer.playerName} ({myPlayer})</p>
      {multiplayer.opponent ? (
        <p>Opponent: {multiplayer.opponent.name} ({myPlayer === PLAYERS.LEFT ? PLAYERS.RIGHT : PLAYERS.LEFT})</p>
      ) : (
        <p>Waiting for opponent...</p>
      )}
      <button onClick={handleLeaveRoom} className={styles.leaveButton}>Leave Room</button>
    </div>
  );
};

MultiplayerInfo.propTypes = {
  multiplayer: PropTypes.shape({
    roomId: PropTypes.string,
    playerName: PropTypes.string,
    opponent: PropTypes.shape({
      name: PropTypes.string
    })
  }),
  myPlayer: PropTypes.string
};

export default MultiplayerInfo;
