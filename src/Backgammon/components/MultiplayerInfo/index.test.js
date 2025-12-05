import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MultiplayerInfo from './index';
import backgammonSlice from '../../slice';
import roomManagerSlice from '../../../RoomManager/slice';

const createMockStore = () => {
  return configureStore({
    reducer: {
      backgammon: backgammonSlice,
      multiplayer: roomManagerSlice,
    },
  });
};

const mockMultiplayer = {
  roomId: 'test-room-123',
  playerName: 'TestPlayer',
  opponent: {
    name: 'OpponentPlayer'
  }
};

describe('MultiplayerInfo', () => {
  it('renders room information', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <MultiplayerInfo multiplayer={mockMultiplayer} myPlayer="PLAYER_LEFT" />
      </Provider>
    );

    expect(screen.getByText('Room: test-room-123')).toBeInTheDocument();
    expect(screen.getByText('You: TestPlayer (PLAYER_LEFT)')).toBeInTheDocument();
  });

  it('shows opponent when available', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <MultiplayerInfo multiplayer={mockMultiplayer} myPlayer="PLAYER_LEFT" />
      </Provider>
    );

    expect(screen.getByText(/Opponent: OpponentPlayer \(left\)/)).toBeInTheDocument();
  });

  it('shows waiting message when no opponent', () => {
    const store = createMockStore();
    const multiplayerWithoutOpponent = { ...mockMultiplayer, opponent: null };

    render(
      <Provider store={store}>
        <MultiplayerInfo multiplayer={multiplayerWithoutOpponent} myPlayer="PLAYER_LEFT" />
      </Provider>
    );

    expect(screen.getByText('Waiting for opponent...')).toBeInTheDocument();
  });

  it('renders leave room button', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <MultiplayerInfo multiplayer={mockMultiplayer} myPlayer="PLAYER_LEFT" />
      </Provider>
    );

    expect(screen.getByText('Leave Room')).toBeInTheDocument();
  });
});
