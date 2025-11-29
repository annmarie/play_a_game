import PropTypes from 'prop-types';
import { DRAW_MESSAGE } from '../globals';
import styles from './StatusBox.module.css';

const StatusBox = ({ winner = null, winnerDesc = '', boardFull = false, player = 'Unknown' }) => {
  if (typeof boardFull !== 'boolean') {
    console.error('StatusBox: expected "boardFull" to be a boolean, received:', boardFull);
  }

  return (
    <div
      aria-label="Game Status"
      className={styles.connect4Status}
      role="status"
      aria-live="polite"
    >
      {winner
        ? `Winner: ${winner} Winning move (${winnerDesc})`
        : boardFull
        ? DRAW_MESSAGE
        : `Current Player: ${player}`}
    </div>
  );
};

StatusBox.propTypes = {
  winner: PropTypes.string,
  winnerDesc: PropTypes.string,
  boardFull: PropTypes.bool.isRequired,
  player: PropTypes.string.isRequired,
};

StatusBox.defaultProps = {
  winner: null,
  winnerDesc: '',
  boardFull: false,
  player: 'Unknown',
};

export default StatusBox;
