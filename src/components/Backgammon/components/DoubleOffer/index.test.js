import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DoubleOffer from './index';
import backgammonSlice from '../../slice';

const createMockStore = () => {
  return configureStore({
    reducer: {
      backgammon: backgammonSlice,
    },
  });
};

describe('DoubleOffer', () => {
  it('renders the offer question', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <DoubleOffer pendingOffer="PLAYER_LEFT" />
      </Provider>
    );

    expect(screen.getByText('Does')).toBeInTheDocument();
    expect(screen.getByText('accept the offer?')).toBeInTheDocument();
  });

  it('renders accept and decline buttons', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <DoubleOffer pendingOffer="PLAYER_LEFT" />
      </Provider>
    );

    expect(screen.getByLabelText('Accept the double')).toBeInTheDocument();
    expect(screen.getByLabelText('Decline the double')).toBeInTheDocument();
  });

  it('shows correct player checker for PLAYER_LEFT offer', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <DoubleOffer pendingOffer="PLAYER_LEFT" />
      </Provider>
    );

    const checker = screen.getByRole('checker');
    expect(checker).toHaveAttribute('id', 'player_left');
  });

  it('shows correct player checker for PLAYER_RIGHT offer', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <DoubleOffer pendingOffer="PLAYER_RIGHT" />
      </Provider>
    );

    const checker = screen.getByRole('checker');
    expect(checker).toHaveAttribute('id', 'player_left');
  });
});
