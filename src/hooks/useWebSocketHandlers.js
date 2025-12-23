import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setConnectionStatus, joinRoom, setOpponent, setError } from '@components/MultiplayerSetup/slice';
import { wsService } from '@services/websocket';

export const useWebSocketHandlers = (gameType, gameActions, playerConstants) => {
  const dispatch = useDispatch();
  const multiplayer = useSelector((state) => state.multiplayer);
  const gameState = useSelector((state) => state[gameType]);

  useEffect(() => {
    wsService.connect();

    const handleConnected = () => {
      dispatch(setConnectionStatus('connected'));
    };

    const handleDisconnected = () => {
      dispatch(setConnectionStatus('disconnected'));
    };

    const handleRoomCreated = (data) => {
      dispatch(joinRoom({ roomId: data.roomId, isHost: true, gameType }));
      dispatch(gameActions.setMultiplayerMode({
        isMultiplayer: true,
        myPlayer: playerConstants.FIRST
      }));
    };

    const handleRoomJoined = (data) => {
      dispatch(joinRoom({ roomId: data.roomId, isHost: false, gameType }));
      if (data.opponent) {
        dispatch(setOpponent({ gameType, opponent: data.opponent }));
        dispatch(gameActions.setMultiplayerMode({
          isMultiplayer: true,
          myPlayer: playerConstants.SECOND
        }));
      }
      // Sync game state if available
      if (data.gameState) {
        dispatch(gameActions.syncGameState(data.gameState));
      }
    };

    const handleOpponentJoined = (data) => {
      dispatch(setOpponent({ gameType, opponent: data.opponent }));
      dispatch(gameActions.setMultiplayerMode({
        isMultiplayer: true,
        myPlayer: playerConstants.FIRST
      }));
    };

    const handleGameMove = (data) => {
      // Only handle moves for the current game type
      if (data.gameType === gameType) {
        dispatch(gameActions.makeMultiplayerMove(data));
      }
    };

    const handleGameSync = (data) => {
      // Only handle sync for the current game type
      if (data.gameType === gameType) {
        dispatch(gameActions.syncGameState(data.gameState));
      }
    };

    const handleError = (error) => {
      dispatch(setError(error.message || 'Connection error'));
    };

    wsService.on('connected', handleConnected);
    wsService.on('disconnected', handleDisconnected);
    wsService.on('roomCreated', handleRoomCreated);
    wsService.on('roomJoined', handleRoomJoined);
    wsService.on('opponentJoined', handleOpponentJoined);
    wsService.on('gameMove', handleGameMove);
    wsService.on('gameSync', handleGameSync);
    wsService.on('error', handleError);

    return () => {
      wsService.off('connected', handleConnected);
      wsService.off('disconnected', handleDisconnected);
      wsService.off('roomCreated', handleRoomCreated);
      wsService.off('roomJoined', handleRoomJoined);
      wsService.off('opponentJoined', handleOpponentJoined);
      wsService.off('gameMove', handleGameMove);
      wsService.off('gameSync', handleGameSync);
      wsService.off('error', handleError);
    };
  }, [dispatch, gameActions, playerConstants, gameType]);

  // Set multiplayer mode if room exists
  useEffect(() => {
    if (multiplayer.rooms?.[gameType]?.roomId && gameState.isMultiplayer === null) {
      dispatch(gameActions.setMultiplayerMode({ isMultiplayer: true, myPlayer: null }));
    }
  }, [multiplayer.rooms, gameType, gameState.isMultiplayer, dispatch, gameActions]);
};
