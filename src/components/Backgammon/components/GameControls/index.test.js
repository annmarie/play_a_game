import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import GameControls from './index';
import backgammonSlice from '../../slice';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      backgammon: backgammonSlice,
    },
    preloadedState: {
      backgammon: {
        diceValue: null,
        potentialMoves: {},
        turnEnding: false,
        winner: null,
        doublingCube: { pendingOffer: null },
        ...initialState,
      },
    },
  });
};

describe('GameControls', () => {
  it('renders roll dice button when no dice value', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <GameControls
          diceValue={null}
          potentialMoves={{}}
          turnEnding={false}
          winner={null}
          doublingCube={{ pendingOffer: null }}
        />
      </Provider>
    );

    expect(screen.getByLabelText('Roll Dice')).toBeInTheDocument();
  });

  it('renders dice and end turn button when dice rolled', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <GameControls
          diceValue={[3, 5]}
          potentialMoves={{}}
          turnEnding={true}
          winner={null}
          doublingCube={{ pendingOffer: null }}
        />
      </Provider>
    );

    expect(screen.getByLabelText('End turn')).toBeInTheDocument();
  });

  it('disables roll dice button when winner exists', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <GameControls
          diceValue={null}
          potentialMoves={{}}
          turnEnding={false}
          winner="PLAYER_LEFT"
          doublingCube={{ pendingOffer: null }}
        />
      </Provider>
    );

    expect(screen.getByLabelText('Roll Dice')).toBeDisabled();
  });
});
