import PropTypes from 'prop-types';
import styles from './Dice.module.css';
import { useEffect, useState, useRef } from 'react';

const DOTS = Array.from({ length: 9 });

const Dice = ({ diceValue = null }) => {
  const [rolling, setRolling] = useState(false);
  const prevDiceValue = useRef(null);

  useEffect(() => {
    if (diceValue && JSON.stringify(diceValue) !== JSON.stringify(prevDiceValue.current)) {
      prevDiceValue.current = diceValue;
      setRolling(true);
      const timer = setTimeout(() => setRolling(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [diceValue]);

  const renderDots = (numDots, diceId) => {
    const dotPositions = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
    };

    const positions = dotPositions[numDots] || [];
    return DOTS.map((_, index) => (
      <div
        key={index}
        className={`${styles.dieDot} ${positions.includes(index) ? styles.visible : ''} ${rolling ? styles.animate : ''}`}
        data-testid={positions.includes(index) ? `die-dot-${diceId}` : ''}
      />
    ));
  };

  const renderDie = (value, id) => (
    <div
      key={id}
      aria-label={`Dice ${id} showing ${value || 0}`}
      className={styles.die}
    >
      {renderDots(value, id)}
    </div>
  );

  if (!Array.isArray(diceValue) || diceValue.length < 1) {
    return null;
  }

  return (
    <div className={styles.diceContainer}>
      {renderDie(diceValue[0], 'left')}
      {diceValue.length > 2 && diceValue[2] && diceValue[2] > 0 && renderDie(diceValue[2], 'doubles-left')}
      {diceValue.length > 1 && diceValue[1] && diceValue[1] > 0 && renderDie(diceValue[1], 'right')}
      {diceValue.length > 3 && diceValue[3] && diceValue[3] > 0 && renderDie(diceValue[3], 'doubles-right')}
    </div>
  );
};

Dice.propTypes = {
  diceValue: PropTypes.arrayOf(PropTypes.number),
};

export default Dice;
