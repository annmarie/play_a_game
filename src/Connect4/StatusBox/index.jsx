import PropTypes from 'prop-types';
import { DRAW_MESSAGE } from '../globals';
import styles from './StatusBox.module.css';

const StatusBox = ({ winner = null, winnerDesc = '', boardFull = false, player = 'Unknown' }) => {
  const normalizedBoardFull = Boolean(boardFull);

  return (
    <div
      aria-label="Game Status"
      className={styles.connect4Status}
      role="status"
      aria-live="polite"
    >
      {winner
        ? `Winner: ${winner} Winning move (${winnerDesc})`
        : normalizedBoardFull
        ? DRAW_MESSAGE
        : `Current Player: ${player}`}
    </div>
  );
};

StatusBox.propTypes = {
  winner: PropTypes.string,
  winnerDesc: PropTypes.string,
  boardFull: PropTypes.bool,
  player: PropTypes.string,
};

export default StatusBox;
