import PropTypes from 'prop-types';
import { MESSAGES, ARIA_LABELS } from '../../globals';
import styles from './StatusBox.module.css';
import PlayerText from '../PlayerText';

const StatusBox = ({ winner = null, winnerDesc = '', boardFull = false, player = 'Unknown', onPlayAgain }) => {
  const normalizedBoardFull = Boolean(boardFull);
  const gameEnded = winner || normalizedBoardFull;

  return (
    <div
      aria-label={ARIA_LABELS.GAME_STATUS}
      className={styles.connect4Status}
      role="status"
      aria-live="polite"
    >
      {winner
        ? <>🎉 Winner: <PlayerText player={winner} /> Winning move ({winnerDesc})</>
        : normalizedBoardFull
        ? MESSAGES.DRAW
        : <>Current Player: <PlayerText player={player} /></>}

      {gameEnded && onPlayAgain && (
        <button
          className={styles.playAgainButton}
          onClick={onPlayAgain}
          aria-label={ARIA_LABELS.PLAY_AGAIN}
        >
          Play Again
        </button>
      )}
    </div>
  );
};

StatusBox.propTypes = {
  winner: PropTypes.string,
  winnerDesc: PropTypes.string,
  boardFull: PropTypes.bool,
  player: PropTypes.string,
  onPlayAgain: PropTypes.func,
};

export default StatusBox;
