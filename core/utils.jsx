import thunk from 'redux-thunk';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import * as reducers from './reducers';

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);

export default function initStore (initialState) {
  return createStoreWithMiddleware(combineReducers(reducers), initialState);
}
