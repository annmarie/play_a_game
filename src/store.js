import { configureStore } from '@reduxjs/toolkit';
import mainReducer from './slice';
import slidepuzzleReducer from './SlidePuzzle/slice';
import connect4Reducer from './Connect4/slice';
import backgammonReducer from './Backgammon/slice';

export const reducer = {
    main: mainReducer,
    slidepuzzle: slidepuzzleReducer,
    connect4: connect4Reducer,
    backgammon: backgammonReducer,
}

export const store = configureStore({ reducer });
