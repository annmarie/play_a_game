import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import RoomManager from './index';
import multiplayerReducer from './slice';
import { wsService } from '../services/websocket';



const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      multiplayer: multiplayerReducer,
    },
    preloadedState: {
      multiplayer: {
        isConnected: false,
        roomId: null,
        playerId: null,
        playerName: '',
        isHost: false,
        opponent: null,
        gameMode: 'local',
        connectionStatus: 'disconnected',
        error: null,
        ...initialState,
      },
    },
  });
};

const renderWithStore = (component, store) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('RoomManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders room creation form when not connected to room', () => {
    const store = createMockStore({ isConnected: true });
    renderWithStore(<RoomManager gameType="connect4" />, store);

    expect(screen.getByText('Multiplayer Setup')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    expect(screen.getByText('Create Room')).toBeInTheDocument();
    expect(screen.getByText('Join Room')).toBeInTheDocument();
  });

  it('shows connection status when disconnected', () => {
    const store = createMockStore({ isConnected: false });
    renderWithStore(<RoomManager gameType="connect4" />, store);

    expect(screen.getByText('Connecting to server...')).toBeInTheDocument();
  });

  it('displays error message when present', () => {
    const store = createMockStore({
      isConnected: true,
      error: 'Test error message'
    });
    renderWithStore(<RoomManager gameType="connect4" />, store);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('creates room when create button clicked with valid name', () => {
    const store = createMockStore({ isConnected: true });
    renderWithStore(<RoomManager gameType="connect4" />, store);

    const nameInput = screen.getByPlaceholderText('Enter your name');
    const createButton = screen.getByText('Create Room');

    fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
    fireEvent.click(createButton);

    expect(wsService.send).toHaveBeenCalledWith('createRoom', {
      gameType: 'connect4',
      playerId: expect.any(String),
      playerName: 'TestPlayer'
    });
  });

  it('joins room when join button clicked with valid inputs', () => {
    const store = createMockStore({ isConnected: true });
    renderWithStore(<RoomManager gameType="connect4" />, store);

    const nameInput = screen.getByPlaceholderText('Enter your name');
    const roomInput = screen.getByPlaceholderText('Room ID');
    const joinButton = screen.getByText('Join Room');

    fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
    fireEvent.change(roomInput, { target: { value: 'ABC123' } });
    fireEvent.click(joinButton);

    expect(wsService.send).toHaveBeenCalledWith('joinRoom', {
      roomId: 'ABC123',
      playerId: expect.any(String),
      playerName: 'TestPlayer'
    });
  });

  it('shows room info when connected to room', () => {
    const store = createMockStore({
      isConnected: true,
      roomId: 'ABC123'
    });
    renderWithStore(<RoomManager gameType="connect4" />, store);

    expect(screen.getByText('Room: ABC123')).toBeInTheDocument();
    expect(screen.getByText('Waiting for opponent...')).toBeInTheDocument();
    expect(screen.getByText('Leave Room')).toBeInTheDocument();
  });

  it('disables buttons when not connected', () => {
    const store = createMockStore({ isConnected: false });
    renderWithStore(<RoomManager gameType="connect4" />, store);

    const createButton = screen.getByText('Create Room');
    const joinButton = screen.getByText('Join Room');

    expect(createButton).toBeDisabled();
    expect(joinButton).toBeDisabled();
  });
});
