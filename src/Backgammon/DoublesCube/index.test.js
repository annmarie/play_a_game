import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DoublesCube from './index';
import backgammonReducer from '../slice';

const mockStore = configureStore({
  reducer: { backgammon: backgammonReducer }
});

describe('DoublesCube', () => {
  it('displays the cube value', () => {
    render(
      <Provider store={mockStore}>
        <DoublesCube
          doublingCube={{ value: 2, owner: null, pendingOffer: null }}
          currentPlayer="left"
          winner={null}
        />
      </Provider>
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows accept/decline buttons when there is a pending offer', () => {
    render(
      <Provider store={mockStore}>
        <DoublesCube
          doublingCube={{ value: 1, owner: null, pendingOffer: 'right' }}
          currentPlayer="left"
          winner={null}
        />
      </Provider>
    );

    expect(screen.getByText('Accept')).toBeInTheDocument();
    expect(screen.getByText('Decline')).toBeInTheDocument();
    expect(screen.getByText('offers to double!')).toBeInTheDocument();
  });

  it('does not show double button when player owns the cube', () => {
    render(
      <Provider store={mockStore}>
        <DoublesCube
          doublingCube={{ value: 2, owner: 'left', pendingOffer: null }}
          currentPlayer="left"
          winner={null}
        />
      </Provider>
    );

    expect(screen.queryByText('Double')).not.toBeInTheDocument();
    expect(screen.getByText('Owned by:')).toBeInTheDocument();
  });
});
