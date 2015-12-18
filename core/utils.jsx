import { createStore, combineReducers } from 'redux';
import { getLocale } from '../components/header/reducers';

var reducers = combineReducers({
  locale: getLocale
});

export default function initStore (initialState) {
  return createStore(reducers, initialState);
}
