import PropTypes from 'prop-types';
import Checker from '../Checker';
import { PLAYER } from '../../globals';
import styles from './RoomStatus.module.css';

const RoomStatus = ({ roomId, opponent, myPlayer, playerName }) => {
  return (
    <div className={styles.multiplayerInfo}>
      <span>Room: {roomId}</span>
      {opponent && (
        <div className={styles.playerNames}>
          <span>
            {myPlayer === PLAYER.LEFT ? playerName || 'You' : (opponent?.name || 'Opponent')} <Checker player={PLAYER.LEFT} />
          </span>
          <span>
            {myPlayer === PLAYER.RIGHT ? playerName || 'You' : (opponent?.name || 'Opponent')} <Checker player={PLAYER.RIGHT} />
          </span>
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
