import { configureStore } from '@reduxjs/toolkit';
import mainReducer from './slice';
import backgammonReducer from './components/Backgammon/slice';
import connect4Reducer from './components/Connect4/slice';
import multiplayerReducer from './components/Multiplayer/slice';

export const reducer = {
    main: mainReducer,
    backgammon: backgammonReducer,
    connect4: connect4Reducer,
    multiplayer: multiplayerReducer,
}

export const store = configureStore({ reducer });
