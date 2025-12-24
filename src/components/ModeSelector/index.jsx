import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import Multiplayer from '@/components/Multiplayer';
import styles from './ModeSelector.module.css';

const ModeSelector = ({ gameType, isMultiplayer, setMultiplayerMode }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('local') === '1') {
      dispatch(setMultiplayerMode({ isMultiplayer: false, myPlayer: null }));
    }
  }, [dispatch, setMultiplayerMode]);

  return (
    <div className={styles.modeSelector}>
      {isMultiplayer === null && <Multiplayer gameType={gameType} />}
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
      {isMultiplayer === true && <Multiplayer gameType={gameType} />}
    </div>
  );
};

ModeSelector.propTypes = {
  gameType: PropTypes.string.isRequired,
  isMultiplayer: PropTypes.oneOf([null, true, false]),
  setMultiplayerMode: PropTypes.func.isRequired
};

export default ModeSelector;
