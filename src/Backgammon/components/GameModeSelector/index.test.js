import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import GameModeSelector from './index';
import backgammonSlice from '../../slice';
import roomManagerSlice from '../../../MultiplayerSetup/slice';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      backgammon: backgammonSlice,
      multiplayer: roomManagerSlice,
    },
    preloadedState: {
      backgammon: {
        isMultiplayer: false,
        ...initialState,
      },
      multiplayer: {
        isConnected: false,
        roomId: null,
        playerName: '',
        error: null,
      },
    },
  });
};

describe('GameModeSelector', () => {
  it('renders local game button', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <GameModeSelector isMultiplayer={false} />
      </Provider>
    );

    expect(screen.getByText('Local Game')).toBeInTheDocument();
  });

  it('renders multiplayer button when not in multiplayer mode', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <GameModeSelector isMultiplayer={false} />
      </Provider>
    );

    expect(screen.getByText('Multiplayer Game')).toBeInTheDocument();
  });

  it('does not render multiplayer button when in multiplayer mode', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <GameModeSelector isMultiplayer={true} />
      </Provider>
    );

    expect(screen.queryByText('Multiplayer Game')).not.toBeInTheDocument();
  });
});
