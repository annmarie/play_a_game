// backgammon point componen
import PropTypes from 'prop-types'
import { useMemo } from 'react'
import Checker from '../../Checker'
import styles from './Point.module.css'
import { BOARD_CONFIG } from '../../../globals';

const Point = ({ point, onClick, selected, potential }) => {
  const pointClasses = useMemo(() => {
    const classes = [
      styles.point,
      point.id % 2 === 0 ? styles.light : styles.dark,
      point.id > BOARD_CONFIG.START_KEY_LEFT ? styles.bottom : '',
      selected ? styles.selected : '',
      potential ? styles.potential : ''
    ];
    return classes.filter(Boolean).join(' ');
  }, [point.id, selected, potential]);

  const testData = useMemo(() => {
    const testClasses = [
      'point',
      point.id % 2 === 0 ? 'light' : 'dark',
      point.id > BOARD_CONFIG.START_KEY_LEFT ? 'bottom' : 'top',
      selected ? 'selected' : '',
      potential ? 'potential' : ''
    ];
    return `point-${point.id} ${testClasses.filter(Boolean).join(' ')}`;
  }, [point.id, selected, potential]);

  const checkers = useMemo(() =>
    Array.from({ length: point.checkers }).map((_, i) => (
      <Checker key={i} player={point.player} />
    )), [point.checkers, point.player]
  );

  return (
    <div
      role="point"
      data-key={point.id}
      className={pointClasses}
      onClick={() => onClick(point)}
      data-testid={testData}
      aria-label={`Point ${point.id} with ${point.checkers} ${point.player ? point.player + ' ' : ''}checkers`}
    >
      {checkers}
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
