import PropTypes from 'prop-types';
import PlayerText from '../PlayerText';
import { PLAYER } from '../../globals';
import styles from './RoomStatus.module.css';

const RoomStatus = ({ roomId, opponent, myPlayer, playerName }) => {
  return (
    <div className={styles.multiplayerInfo}>
      <span>Room: {roomId}</span>
      {opponent && (
        <div className={styles.playerNames}>
          <PlayerText player={PLAYER.ONE}>
            {myPlayer === PLAYER.ONE ? playerName || 'You' : (opponent?.name || 'Opponent')} ({PLAYER.ONE})
          </PlayerText>
          <PlayerText player={PLAYER.TWO}>
            {myPlayer === PLAYER.TWO ? playerName || 'You' : (opponent?.name || 'Opponent')} ({PLAYER.TWO})
          </PlayerText>
        </div>
      )}
    </div>
  );
};

RoomStatus.propTypes = {
  roomId: PropTypes.string.isRequired,
  opponent: PropTypes.shape({
    name: PropTypes.string
  }),
  myPlayer: PropTypes.string,
  playerName: PropTypes.string
};

export default RoomStatus;
