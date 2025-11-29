import PropTypes from 'prop-types'
import { PLAYER_RIGHT, PLAYER_LEFT } from '../globals';
import styles from './Checker.module.css'

const getClassNames = (player, selected) => {
  let classes = [styles.checker, 'checker'];
  if (player === PLAYER_RIGHT) {
    classes.push(styles.playerRight, 'player_right');
  } else if (player === PLAYER_LEFT) {
    classes.push(styles.playerLeft, 'player_left');
  }
  if (selected) {
    classes.push(styles.selected, 'selected');
  }
  return classes.join(' ');
};

const Checker = ({ player, selected }) => {
  const classNames = getClassNames(player, selected);
  return (<div role="checker" className={classNames}></div>);
};

Checker.propTypes = {
  player: PropTypes.string.isRequired,
  selected: PropTypes.bool
};

export default Checker;
