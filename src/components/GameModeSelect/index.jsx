import PropTypes from 'prop-types';
import styles from './GameModeSelect.module.css';

const GameModeSelect = ({ onLocal, onOnline }) => (
  <div className={styles.modeSelect}>
    <p className={styles.prompt}>How do you want to play?</p>
    <div className={styles.options}>
      <button type="button" className={styles.modeButton} onClick={onLocal}>
        <span className={styles.modeName}>Play on This Device</span>
        <span className={styles.modeDesc}>Two players, one screen</span>
      </button>
      <button type="button" className={styles.modeButton} onClick={onOnline}>
        <span className={styles.modeName}>Play Online</span>
        <span className={styles.modeDesc}>Create or join a room</span>
      </button>
    </div>
  </div>
);

GameModeSelect.propTypes = {
  onLocal: PropTypes.func.isRequired,
  onOnline: PropTypes.func.isRequired,
};

export default GameModeSelect;
