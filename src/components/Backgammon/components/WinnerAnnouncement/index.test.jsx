import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import WinnerAnnouncement from './index';
import backgammonSlice from '../../slice';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      backgammon: backgammonSlice,
    },
    preloadedState: {
      backgammon: {
        winner: null,
        ...initialState,
      },
    },
  });
};

describe('WinnerAnnouncement', () => {
  it('should render winner announcement with player', async () => {
    const store = createMockStore();

    await act(async () => render(
      <Provider store={store}>
        <WinnerAnnouncement winner="white" />
      </Provider>
    ));

    expect(screen.getByText('🎉 Winner:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play another game' })).toBeInTheDocument();
  });

  it('should dispatch playAgain action when button is clicked', async () => {
    const store = createMockStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    await act(async () => render(
      <Provider store={store}>
        <WinnerAnnouncement winner="black" />
      </Provider>
    ));

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Play another game' })));

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'backgammon/playAgain' })
    );
  });
});
