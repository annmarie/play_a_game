import PropTypes from 'prop-types';
import styles from './Dice.module.css';
import { useEffect, useState } from 'react';

const Dice = ({ diceValue = null }) => {
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (diceValue) {
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
    return Array.from({ length: 9 }).map((_, index) => (
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

  return (
    diceValue && (
      <div className={styles.diceContainer}>
        {renderDie(diceValue[0], 'left')}
        {diceValue[2] > 0 && renderDie(diceValue[2], 'doubles-left')}

        {diceValue[1] > 0 && renderDie(diceValue[1], 'right')}
        {diceValue[3] > 0 && renderDie(diceValue[3], 'doubles-right')}
      </div>
    )
  );
};

Dice.propTypes = {
  diceValue: PropTypes.arrayOf(PropTypes.number),
};

export default Dice;