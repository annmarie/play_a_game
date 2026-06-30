import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { reducer } from '../store';
import Backgammon from './Backgammon';
import Connect4 from './Connect4';

// Store with no multiplayer mode chosen yet (isMultiplayer === null) and no server/room.
const createStore = () =>
  configureStore({
    reducer,
    preloadedState: {
      multiplayer: { isConnected: false, rooms: {}, playerName: null },
    },
  });

const renderGame = (Game, store) =>
  render(
    <BrowserRouter>
      <Provider store={store}>
        <Game />
      </Provider>
    </BrowserRouter>
  );

describe('Local (single-device) play mode', () => {
  it('Backgammon: offers a mode choice and starts a local game with no server', async () => {
    const store = createStore();
    await act(async () => renderGame(Backgammon, store));

    // The mode chooser is shown instead of jumping straight to the online room form.
    expect(screen.getByText('Play on This Device')).toBeInTheDocument();
    expect(screen.queryAllByRole('gridcell')).toHaveLength(0);

    await act(async () => {
      fireEvent.click(screen.getByText('Play on This Device'));
    });

    // Board is now playable locally, and the opening dice have been rolled.
    expect(screen.getAllByRole('gridcell')).toHaveLength(24);
    expect(store.getState().backgammon.isMultiplayer).toBe(false);
    expect(store.getState().backgammon.gameStarted).toBe(true);
    expect(store.getState().backgammon.player).not.toBeNull();
    expect(screen.getByRole('button', { name: /exit to menu/i })).toBeInTheDocument();
  });

  it('Connect4: offers a mode choice and starts a local game with no server', async () => {
    const store = createStore();
    await act(async () => renderGame(Connect4, store));

    const columnQuery = { name: /drop in column/i };
    expect(screen.getByText('Play on This Device')).toBeInTheDocument();
    expect(screen.queryAllByRole('button', columnQuery)).toHaveLength(0);

    await act(async () => {
      fireEvent.click(screen.getByText('Play on This Device'));
    });

    expect(screen.getAllByRole('button', columnQuery)).toHaveLength(7); // 7 columns
    expect(screen.getAllByTestId('connect4-cell')).toHaveLength(42); // 6 x 7 grid
    expect(store.getState().connect4.isMultiplayer).toBe(false);
    expect(screen.getByRole('button', { name: /exit to menu/i })).toBeInTheDocument();
  });

  it('Backgammon: "Exit to Menu" returns to the mode chooser', async () => {
    const store = createStore();
    await act(async () => renderGame(Backgammon, store));

    await act(async () => fireEvent.click(screen.getByText('Play on This Device')));
    expect(screen.getAllByRole('gridcell')).toHaveLength(24);

    await act(async () => fireEvent.click(screen.getByRole('button', { name: /exit to menu/i })));
    expect(screen.getByText('Play on This Device')).toBeInTheDocument();
    expect(screen.queryAllByRole('gridcell')).toHaveLength(0);
    expect(store.getState().backgammon.isMultiplayer).toBeNull();
  });
});
