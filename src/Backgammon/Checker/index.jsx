import PropTypes from 'prop-types'
import { PLAYER_RIGHT, PLAYER_LEFT } from '../globals';
import styles from './Checker.module.css'

const Checker = ({ player, selected }) => {
  const classNames = [
    styles.checker,
    'checker', // Keep original class for tests
    player === PLAYER_RIGHT ? styles.playerRight : '',
    player === PLAYER_RIGHT ? 'player_right' : '', // Keep original class for tests
    player === PLAYER_LEFT ? styles.playerLeft : '',
    player === PLAYER_LEFT ? 'player_left' : '', // Keep original class for tests
    selected ? styles.selected : '',
    selected ? 'selected' : '' // Keep original class for tests
  ].filter(Boolean).join(' ');
  
  return (<div role="checker" className={classNames}></div>)
};

Checker.propTypes = {
  player: PropTypes.string.isRequired,
  selected: PropTypes.bool
};

export default Checker;
