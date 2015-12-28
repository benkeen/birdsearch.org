import thunk from 'redux-thunk';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { locale } from '../components/header/reducers';
import { userLocation } from '../components/main-panel/reducers';
import { sidebarVisible } from '../components/sidebar/reducers';
import { searchSettings, mapSettings, overlays } from './reducers';

// react-thunk allows
const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);

var reducers = combineReducers({
  locale,

  sidebarVisible,

  userLocation,
  overlays,
  mapSettings,
  searchSettings
});


export default function initStore (initialState) {
  return createStoreWithMiddleware(reducers, initialState);
}
