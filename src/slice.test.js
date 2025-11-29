/* globals beforeEach, describe, expect, it */
import { configureStore } from '@reduxjs/toolkit';
import mainReducer, { initialState, setName } from './slice';

describe('Main Slice', () => {
  let store;
  let state;

  beforeEach(() => {
    store = configureStore({ reducer: mainReducer });
    state = store.getState();
  });

  it('should initialize with the correct state', () => {
    expect(state).toEqual(initialState);
  });

  it('should set name value', () => {
    expect(state.name).toBe(null);
    store.dispatch(setName('Bob'));
    state = store.getState();
    expect(state.name).toBe('Bob');
  });
});
