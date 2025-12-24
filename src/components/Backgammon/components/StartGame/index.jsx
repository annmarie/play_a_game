import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { startGame } from '../../slice';
import styles from './StartGame.module.css';

const StartGame = ({ isMultiplayer, hasOpponent, gameStarted }) => {
  const dispatch = useDispatch();

  if (!isMultiplayer || !hasOpponent || gameStarted) {
    return null;
  }

  return (
    <div className={styles.startGameSection}>
      <button
        onClick={() => dispatch(startGame())}
        className={styles.startGameButton}
      >
        Roll Dice to Start Game
      </button>
      <p className={styles.startGameText}>First roll determines who goes first</p>
    </div>
  );
};

StartGame.propTypes = {
  isMultiplayer: PropTypes.bool,
  hasOpponent: PropTypes.bool,
  gameStarted: PropTypes.bool
};

export default StartGame;
