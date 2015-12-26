import { createStore, combineReducers } from 'redux';
import { getLocale } from '../components/header/reducers';
import { getIntroOverlayVisibility } from '../components/main-panel/reducers';

var reducers = combineReducers({
  locale: getLocale,
  introOverlayVisible: getIntroOverlayVisibility
});

export default function initStore (initialState) {
  return createStore(reducers, initialState);
}
