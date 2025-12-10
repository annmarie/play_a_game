import { configureStore } from '@reduxjs/toolkit';
import mainReducer from './slice';
import backgammonReducer from './Backgammon/slice';
import connect4Reducer from './Connect4/slice';
import multiplayerReducer from './MultiplayerSetup/slice';

export const reducer = {
    main: mainReducer,
    backgammon: backgammonReducer,
    connect4: connect4Reducer,
    multiplayer: multiplayerReducer,
}

export const store = configureStore({ reducer });
