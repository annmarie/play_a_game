import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { rollDice, endTurn } from '../slice';

export const useKeyboardControls = (diceValue, turnEnding) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ') {
        if (turnEnding) {
          dispatch(endTurn());
        } else if (diceValue === null) {
          dispatch(rollDice());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [diceValue, turnEnding, dispatch]);
};
