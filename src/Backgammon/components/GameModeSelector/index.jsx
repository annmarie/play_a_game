import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { setMultiplayerMode } from '../../slice';
import MultiplayerSetup from '../../../MultiplayerSetup';
import styles from './GameModeSelector.module.css';

const GameModeSelector = ({ isMultiplayer }) => {
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
      {isMultiplayer && <MultiplayerSetup gameType="backgammon" />}
    </div>
  );
};

GameModeSelector.propTypes = {
  isMultiplayer: PropTypes.bool
};

export default GameModeSelector;
