import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { PLAYER_LEFT, PLAYER_RIGHT } from '../globals';
import { setMultiplayerMode } from '../slice';
import { leaveRoom } from '../../RoomManager/slice';
import { wsService } from '../../services/websocket';
import styles from '../Backgammon.module.css';

const MultiplayerInfo = ({ multiplayer, myPlayer }) => {
  const dispatch = useDispatch();

  const handleLeaveRoom = () => {
    dispatch(leaveRoom());
    dispatch(setMultiplayerMode({ isMultiplayer: false, myPlayer: null }));
    wsService.send('leaveRoom', { roomId: multiplayer.roomId });
  };

  return (
    <div className={styles.multiplayerInfo}>
      <p>Room: {multiplayer.roomId}</p>
      <p>You: {multiplayer.playerName} ({myPlayer})</p>
      {multiplayer.opponent ? (
        <p>Opponent: {multiplayer.opponent.name} ({myPlayer === PLAYER_LEFT ? PLAYER_RIGHT : PLAYER_LEFT})</p>
      ) : (
        <p>Waiting for opponent...</p>
      )}
      <button onClick={handleLeaveRoom}>Leave Room</button>
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
