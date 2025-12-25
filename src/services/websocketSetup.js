import { wsService } from './websocket';
import { setConnectionStatus } from '@components/Multiplayer/slice';

export const setupWebSocketListeners = (store) => {
  wsService.on('connected', () => {
    store.dispatch(setConnectionStatus('connected'));
  });

  wsService.on('disconnected', () => {
    store.dispatch(setConnectionStatus('disconnected'));
  });

  wsService.on('error', () => {
    store.dispatch(setConnectionStatus('disconnected'));
  });
};
