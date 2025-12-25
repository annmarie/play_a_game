import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { playAgain } from '../../slice';
import Checker from '../Checker';
import styles from './WinnerAnnouncement.module.css';
import { ARIA_LABELS } from '../../globals';

const WinnerAnnouncement = ({ winner }) => {
  const dispatch = useDispatch();

  return (
    <div className={styles.winnerAnnouncement}>
      🎉 Winner: <Checker player={winner} />
      <button
        className={styles.playAgainButton}
        onClick={() => dispatch(playAgain())}
        aria-label={ARIA_LABELS.PLAY_AGAIN}
      >
        Play Again
      </button>
    </div>
  );
};

WinnerAnnouncement.propTypes = {
  winner: PropTypes.string
};

export default WinnerAnnouncement;
