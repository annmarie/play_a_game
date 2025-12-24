import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DoublesCube from './index';
import backgammonSlice from '../../../slice';

const createMockStore = () => {
  return configureStore({
    reducer: {
      backgammon: backgammonSlice,
    },
  });
};

const defaultProps = {
  doublingCube: {
    value: 2,
    owner: null,
    pendingOffer: null
  },
  currentPlayer: 'PLAYER_LEFT',
  winner: null,
  turnEnding: true
};

describe('DoublesCube', () => {
  it('renders cube value', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <DoublesCube {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows owner when cube is owned', () => {
    const store = createMockStore();
    const props = {
      ...defaultProps,
      doublingCube: { ...defaultProps.doublingCube, owner: 'PLAYER_LEFT' }
    };

    render(
      <Provider store={store}>
        <DoublesCube {...props} />
      </Provider>
    );

    expect(screen.getByText('Owned by:')).toBeInTheDocument();
  });

  it('shows double button when can offer double', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <DoublesCube {...defaultProps} />
      </Provider>
    );

    expect(screen.getByLabelText('Offer to double the stakes')).toBeInTheDocument();
  });

  it('shows pending offer message', () => {
    const store = createMockStore();
    const props = {
      ...defaultProps,
      doublingCube: { ...defaultProps.doublingCube, pendingOffer: 'PLAYER_RIGHT' }
    };

    render(
      <Provider store={store}>
        <DoublesCube {...props} />
      </Provider>
    );

    expect(screen.getByText('offers to double!')).toBeInTheDocument();
  });

  it('shows accept/decline buttons for pending offer', () => {
    const store = createMockStore();
    const props = {
      ...defaultProps,
      doublingCube: { ...defaultProps.doublingCube, pendingOffer: 'PLAYER_RIGHT' }
    };

    render(
      <Provider store={store}>
        <DoublesCube {...props} />
      </Provider>
    );

    expect(screen.getByLabelText('Accept the double')).toBeInTheDocument();
    expect(screen.getByLabelText('Decline the double')).toBeInTheDocument();
  });
});
