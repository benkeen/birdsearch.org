/**
 *
 */
import { createStore, combineReducers } from 'redux';
import { L } from '../components/lang/en';
import { C } from './constants';
import { E } from './events';
import { selectLang } from '../components/header/reducers';

var reducers = combineReducers({
  lang: selectLang
});

var store = createStore(reducers);

export { C, E, L, store };
