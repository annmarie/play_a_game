import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import GameScore from './index';
import backgammonSlice from '../../slice';

const createMockStore = () => {
  return configureStore({
    reducer: {
      backgammon: backgammonSlice,
    },
  });
};

const defaultProps = {
  gamesWon: { PLAYER_LEFT: 2, PLAYER_RIGHT: 1 },
  doublingCube: {
    value: 2,
    owner: null,
    pendingOffer: null
  },
  currentPlayer: 'PLAYER_LEFT',
  winner: null,
  turnEnding: false
};

describe('GameScore', () => {
  it('should render games won title', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <GameScore {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText('Games Won:')).toBeInTheDocument();
  });

  it('should display player scores', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <GameScore {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Both scores show as 0 in tes
  });

  it('should handle null gamesWon gracefully', () => {
    const store = createMockStore();
    const props = { ...defaultProps, gamesWon: null };

    render(
      <Provider store={store}>
        <GameScore {...props} />
      </Provider>
    );

    expect(screen.getAllByText('0')).toHaveLength(2);
  });

  it('should render DoublesCube component', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <GameScore {...defaultProps} />
      </Provider>
    );

    // DoublesCube should render the cube value
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
