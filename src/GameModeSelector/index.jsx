import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import MultiplayerSetup from '../MultiplayerSetup';
import styles from './GameModeSelector.module.css';

const GameModeSelector = ({ gameType, isMultiplayer, setMultiplayerMode }) => {
  const dispatch = useDispatch();

  return (
    <div className={styles.gameModeSelector}>
      <button
        onClick={() => dispatch(setMultiplayerMode({ isMultiplayer: false, myPlayer: null }))}
        className={styles.modeButton}
      >
        Local Game
      </button>
      {!isMultiplayer && (
        <button
          onClick={() => dispatch(setMultiplayerMode({ isMultiplayer: true, myPlayer: null }))}
          className={styles.modeButton}
        >
          Multiplayer Game
        </button>
      )}
      {isMultiplayer && <MultiplayerSetup gameType={gameType} />}
    </div>
  );
};

GameModeSelector.propTypes = {
  gameType: PropTypes.string.isRequired,
  isMultiplayer: PropTypes.bool.isRequired,
  setMultiplayerMode: PropTypes.func.isRequired
};

export default GameModeSelector;
