import PropTypes from 'prop-types'
import Checker from '../Checker'
import styles from './Point.module.css'
import { START_KEY_LEFT } from '../globals';

const Point = ({ point, onClick, selected, potential }) => {
  const getPointClasses = (id) => {
    const classes = [
      styles.point,
      'point', // Keep original class for tests
      id % 2 === 0 ? styles.light : styles.dark,
      id % 2 === 0 ? 'light' : 'dark', // Keep original classes for tests
      id > START_KEY_LEFT ? styles.bottom : '',
      id > START_KEY_LEFT ? 'bottom' : 'top', // Keep original classes for tests
      selected ? styles.selected : '',
      selected ? 'selected' : '', // Keep original class for tests
      potential ? styles.potential : '',
      potential ? 'potential' : '' // Keep original class for tests
    ];
    return classes.filter(Boolean).join(' ');
  };

  return (
    <div
      key={point.id}
      role="point"
      data-key={point.id}
      className={getPointClasses(point.id)}
      onClick={() => onClick(point)}
      data-testid={`point-${point.id}`}
      aria-label={`Point ${point.id} with ${point.checkers} ${point.player ? point.player + ' ': ''}checkers`}
    >
      {Array.from({ length: point.checkers }).map((_, i) => (
        <Checker key={i} player={point.player} />
      ))}
    </div>
  );
};

Point.propTypes = {
  point: PropTypes.shape({
    id: PropTypes.number.isRequired,
    checkers: PropTypes.number,
    player: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  selected: PropTypes.bool,
  potential: PropTypes.bool
};

export default Point;
