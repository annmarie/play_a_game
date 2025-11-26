import { PLAYER_LEFT, PLAYER_RIGHT } from './globals';

export const testBoards = {
  bearOffTest: {
    points: Array.from({ length: 24 }, (_, i) => {
      const id = i + 1;
      let checkers = 0;
      let player = null;

      if (id === 7) { checkers = 5; player = PLAYER_RIGHT; }
      if (id === 8) { checkers = 5; player = PLAYER_RIGHT; }
      if (id === 9) { checkers = 2; player = PLAYER_RIGHT; }
      if (id === 10) { checkers = 2; player = PLAYER_RIGHT; }
      if (id === 11) { checkers = 1; player = PLAYER_RIGHT; }
      if (id === 19) { checkers = 5; player = PLAYER_LEFT; }
      if (id === 20) { checkers = 3; player = PLAYER_LEFT; }
      if (id === 21) { checkers = 2; player = PLAYER_LEFT; }
      if (id === 22) { checkers = 3; player = PLAYER_LEFT; }
      if (id === 23) { checkers = 2; player = PLAYER_LEFT; }

      return { id, checkers, player };
    }),
    checkersOnBar: { [PLAYER_LEFT]: 0, [PLAYER_RIGHT]: 0 },
    player: PLAYER_RIGHT,
    diceValue: [4, 4, 4]
  },

  endGame: {
    points: Array.from({ length: 24 }, (_, i) => {
      const id = i + 1;
      let checkers = 0;
      let player = null;

      if (id === 23) { checkers = 2; player = PLAYER_LEFT; }
      if (id === 24) { checkers = 1; player = PLAYER_LEFT; }
      if (id === 11) { checkers = 1; player = PLAYER_RIGHT; }
      if (id === 12) { checkers = 2; player = PLAYER_RIGHT; }

      return { id, checkers, player };
    }),
    checkersOnBar: { [PLAYER_LEFT]: 0, [PLAYER_RIGHT]: 0 },
    checkersBorneOff: { [PLAYER_LEFT]: 12, [PLAYER_RIGHT]: 12 },
    player: PLAYER_LEFT,
    diceValue: [6, 5]
  }
};