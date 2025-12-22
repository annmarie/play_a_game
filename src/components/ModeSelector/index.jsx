import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import MultiplayerSetup from '@components/MultiplayerSetup';
import styles from './ModeSelector.module.css';

const GameModeSelector = ({ gameType, isMultiplayer, setMultiplayerMode }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('local') === '1') {
      dispatch(setMultiplayerMode({ isMultiplayer: false, myPlayer: null }));
    }
  }, [dispatch, setMultiplayerMode]);

  return (
    <div className={styles.gameModeSelector}>
      {isMultiplayer === null && <MultiplayerSetup gameType={gameType} />}
      {isMultiplayer === false && (
        <>
          <button
            onClick={() => dispatch(setMultiplayerMode({ isMultiplayer: true, myPlayer: null }))}
            className={styles.modeButton}
          >
            Multiplayer Game
          </button>
        </>
      )}
      {isMultiplayer === true && <MultiplayerSetup gameType={gameType} />}
    </div>
  );
};

GameModeSelector.propTypes = {
  gameType: PropTypes.string.isRequired,
  isMultiplayer: PropTypes.bool.isRequired,
  setMultiplayerMode: PropTypes.func.isRequired
};

export default GameModeSelector;
