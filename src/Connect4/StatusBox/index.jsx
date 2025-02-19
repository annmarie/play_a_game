import PropTypes from 'prop-types';
import { DRAW_MESSAGE } from '../globals';
import './styles.css';

const StatusBox = ({ winner, winnerDesc, boardFull, player }) => {
  return (
    <div
      aria-label="Game Status"
      className="connect4-status"
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

export default StatusBox;
