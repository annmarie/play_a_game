import PropTypes from 'prop-types'
import { useMemo } from 'react'
import Checker from '../Checker'
import styles from './Point.module.css'
import { START_KEY_LEFT } from '../globals';

const Point = ({ point, onClick, selected, potential }) => {
  const getPointClasses = (id) => {
    const classes = [
      styles.point,
      id % 2 === 0 ? styles.light : styles.dark,
      id > START_KEY_LEFT ? styles.bottom : '',
      selected ? styles.selected : '',
      potential ? styles.potential : ''
    ];
    return classes.filter(Boolean).join(' ');
  };

  const getTestData = (id) => {
    const testClasses = [
      'point',
      id % 2 === 0 ? 'light' : 'dark',
      id > START_KEY_LEFT ? 'bottom' : 'top',
      selected ? 'selected' : '',
      potential ? 'potential' : ''
    ];
    return testClasses.filter(Boolean).join(' ');
  };

  return (
    <div
      key={point.id}
      role="point"
      data-key={point.id}
      className={getPointClasses(point.id)}
      onClick={() => onClick(point)}
      data-testid={`point-${point.id} ${getTestData(point.id)}`}
      aria-label={`Point ${point.id} with ${point.checkers} ${point.player ? point.player + ' ' : ''}checkers`}
    >
      {useMemo(() =>
        Array.from({ length: point.checkers }).map((_, i) => (
          <Checker key={i} player={point.player} />
        )), [point.checkers, point.player]
      )}
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
