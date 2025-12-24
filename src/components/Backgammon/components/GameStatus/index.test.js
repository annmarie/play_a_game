import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import GameStatus from './index';
import backgammonSlice from '../../slice';

const createMockStore = () => {
  return configureStore({
    reducer: {
      backgammon: backgammonSlice,
    },
  });
};

const defaultProps = {
  player: 'PLAYER_LEFT',
  winner: null,
  pointsHistory: [{}],
  isMultiplayer: false,
  checkersBorneOff: { PLAYER_LEFT: 0, PLAYER_RIGHT: 0 },
  checkersOnBar: { PLAYER_LEFT: 0, PLAYER_RIGHT: 0 },
  roomId: null
};

describe('GameStatus', () => {
  it('should render current player when no winner', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <GameStatus {...defaultProps} />
      </Provider>
    );

    expect(screen.getByLabelText('Current player PLAYER_LEFT')).toBeInTheDocument();
  });

  it('should render undo button', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <GameStatus {...defaultProps} />
      </Provider>
    );

    expect(screen.getByLabelText('Undo last move')).toBeInTheDocument();
  });

  it('should show borne off checkers when present', () => {
    const store = createMockStore();
    const props = {
      ...defaultProps,
      checkersBorneOff: { PLAYER_LEFT: 3, PLAYER_RIGHT: 0 }
    };

    render(
      <Provider store={store}>
        <GameStatus {...props} />
      </Provider>
    );

    // The component only shows borne off when > 0, so check if the section exists
    const borneOffSection = document.querySelector('.borneOff');
    expect(borneOffSection).toBeInTheDocument();
  });

  it('should show checkers on bar when present', () => {
    const store = createMockStore();
    const props = {
      ...defaultProps,
      checkersOnBar: { PLAYER_LEFT: 2, PLAYER_RIGHT: 0 }
    };

    render(
      <Provider store={store}>
        <GameStatus {...props} />
      </Provider>
    );

    // The component only shows bar when > 0, so check if the section exists
    const barSection = document.querySelector('.bar');
    expect(barSection).toBeInTheDocument();
  });

  it('should disable undo button in multiplayer mode', () => {
    const store = createMockStore();
    const props = { ...defaultProps, isMultiplayer: true };

    render(
      <Provider store={store}>
        <GameStatus {...props} />
      </Provider>
    );

    expect(screen.getByLabelText('Undo last move')).toBeDisabled();
  });
});
