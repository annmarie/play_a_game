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
  it('renders current player when no winner', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <GameStatus {...defaultProps} />
      </Provider>
    );

    expect(screen.getByLabelText('Current player PLAYER_LEFT')).toBeInTheDocument();
  });

  it('renders undo and end game buttons', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <GameStatus {...defaultProps} />
      </Provider>
    );

    expect(screen.getByLabelText('Undo last move')).toBeInTheDocument();
    expect(screen.getByLabelText('End the game')).toBeInTheDocument();
  });

  it('shows borne off checkers when present', () => {
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

  it('shows checkers on bar when present', () => {
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

  it('disables buttons in multiplayer mode', () => {
    const store = createMockStore();
    const props = { ...defaultProps, isMultiplayer: true };

    render(
      <Provider store={store}>
        <GameStatus {...props} />
      </Provider>
    );

    expect(screen.getByLabelText('Undo last move')).toBeDisabled();
    expect(screen.getByLabelText('End the game')).toBeInTheDocument();
  });
});
