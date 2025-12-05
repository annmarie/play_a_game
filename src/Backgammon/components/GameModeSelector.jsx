import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { setMultiplayerMode } from '../slice';
import RoomManager from '../../RoomManager';
import styles from '../Backgammon.module.css';

const GameModeSelector = ({ isMultiplayer }) => {
  const dispatch = useDispatch();

  return (
    <div className={styles.gameModeSelector}>
      <button
        onClick={() => dispatch(setMultiplayerMode({ isMultiplayer: false, myPlayer: null }))}
        style={{ backgroundColor: '#6c757d', color: 'white' }}
      >
        Local Game
      </button>
      {!isMultiplayer && (
        <button
          onClick={() => dispatch(setMultiplayerMode({ isMultiplayer: true, myPlayer: null }))}
          style={{ backgroundColor: '#6c757d', color: 'white' }}
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
