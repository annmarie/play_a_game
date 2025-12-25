// backgammon point componen
import PropTypes from 'prop-types'
import { useMemo } from 'react'
import Checker from '../../Checker'
import styles from './Point.module.css'
import { BOARD_CONFIG, CSS_CLASSES, ARIA_LABELS } from '../../../globals';

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
      CSS_CLASSES.POINT,
      point.id % 2 === 0 ? CSS_CLASSES.LIGHT : CSS_CLASSES.DARK,
      point.id > BOARD_CONFIG.START_KEY_LEFT ? CSS_CLASSES.BOTTOM : CSS_CLASSES.TOP,
      selected ? CSS_CLASSES.SELECTED : '',
      potential ? CSS_CLASSES.POTENTIAL : ''
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
      aria-label={ARIA_LABELS.POINT(point.id, point.checkers, point.player)}
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
