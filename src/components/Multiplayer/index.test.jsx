import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Multiplayer from './index';
import multiplayerReducer from './slice';
import mainReducer from '@/slice';
import { wsService } from '@services/websocket';

jest.mock('@services/websocket');

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      multiplayer: multiplayerReducer,
      main: mainReducer,
    },
    preloadedState: {
      multiplayer: {
        isConnected: false,
        playerId: null,
        playerName: '',
        connectionStatus: 'disconnected',
        error: null,
        rooms: {},
        ...initialState,
      },
      main: {
        name: null,
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

describe('Multiplayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render room creation form when not connected to room', () => {
    const store = createMockStore({ isConnected: true });
    renderWithStore(<Multiplayer gameType="connect4" />, store);

    expect(screen.getByText('Multiplayer Setup')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    expect(screen.getByText('Create Room')).toBeInTheDocument();
    expect(screen.getByText('Join Room')).toBeInTheDocument();
  });

  it('shows connection status when disconnected', () => {
    const store = createMockStore({ isConnected: false });
    renderWithStore(<Multiplayer gameType="connect4" />, store);

    expect(screen.getByText('Connecting to server...')).toBeInTheDocument();
  });

  it('should display error message when present', () => {
    const store = createMockStore({
      isConnected: true,
      error: 'Test error message'
    });
    renderWithStore(<Multiplayer gameType="connect4" />, store);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should create room when create button clicked with valid name', () => {
    const store = createMockStore({ isConnected: true });
    renderWithStore(<Multiplayer gameType="connect4" />, store);

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

  it('should join room when join button clicked with valid inputs', () => {
    const store = createMockStore({ isConnected: true });
    renderWithStore(<Multiplayer gameType="connect4" />, store);

    const nameInput = screen.getByPlaceholderText('Enter your name');
    const roomInput = screen.getByPlaceholderText('Room ID');
    const joinButton = screen.getByText('Join Room');

    fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
    fireEvent.change(roomInput, { target: { value: 'ABC123' } });
    fireEvent.click(joinButton);

    expect(wsService.send).toHaveBeenCalledWith('joinRoom', {
      gameType: 'connect4',
      roomId: 'ABC123',
      playerId: expect.any(String),
      playerName: 'TestPlayer'
    });
  });

  it('should show room info when connected to room', () => {
    const store = createMockStore({
      isConnected: true,
      rooms: {
        connect4: {
          roomId: 'ABC123',
          isHost: true,
          opponent: null
        }
      }
    });
    renderWithStore(<Multiplayer gameType="connect4" />, store);

    expect(screen.getByText('Room: ABC123')).toBeInTheDocument();
    expect(screen.getByText('Waiting for opponent...')).toBeInTheDocument();
    expect(screen.getByText('Leave Room')).toBeInTheDocument();
  });

  it('should show connecting message when not connected', () => {
    const store = createMockStore({ isConnected: false });
    renderWithStore(<Multiplayer gameType="connect4" />, store);

    expect(screen.getByText('Connecting to server...')).toBeInTheDocument();
    expect(screen.queryByText('Create Room')).not.toBeInTheDocument();
    expect(screen.queryByText('Join Room')).not.toBeInTheDocument();
  });
});
