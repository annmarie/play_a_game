import { render, screen } from '@testing-library/react';
import StatusBox from '../StatusBox';
import { MESSAGES } from '../../globals';

describe('StatusBox Component', () => {
  it('should render the winner message when a winner exists', () => {
    render(
      <StatusBox
        winner="Player 1"
        winnerDesc="horizontal"
        boardFull={false}
        player="Player 2"
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Winner: Player 1 Winning move (horizontal)'
    );
  });

  it('should render the draw message when the board is full and no winner exists', () => {
    render(
      <StatusBox
        winner={null}
        winnerDesc=""
        boardFull={true}
        player="Player 2"
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent(MESSAGES.DRAW);
  });

  it('should render the current player message when the game is ongoing', () => {
    render(
      <StatusBox
        winner={null}
        winnerDesc=""
        boardFull={false}
        player="Player 2"
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('Current Player: Player 2');
  });

  it('should handle missing optional props gracefully', () => {
    render(
      <StatusBox
        winner={null}
        winnerDesc=""
        boardFull={false}
        player="Player 1"
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('Current Player: Player 1');
  });
});
