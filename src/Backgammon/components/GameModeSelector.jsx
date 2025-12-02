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
        className={!isMultiplayer ? styles.activeMode : ''}
      >
        Local Game
      </button>
      <RoomManager gameType="backgammon" />
    </div>
  );
};

GameModeSelector.propTypes = {
  isMultiplayer: PropTypes.bool
};

export default GameModeSelector;