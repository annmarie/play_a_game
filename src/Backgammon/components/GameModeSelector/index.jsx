import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { setMultiplayerMode } from '../../slice';
import RoomManager from '../../../RoomManager';
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
      {isMultiplayer && <RoomManager gameType="backgammon" />}
    </div>
  );
};

GameModeSelector.propTypes = {
  isMultiplayer: PropTypes.bool
};

export default GameModeSelector;
