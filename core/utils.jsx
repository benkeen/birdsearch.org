import thunk from 'redux-thunk';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { locale } from '../components/header/reducers';
import { userLocation, panelVisibility } from '../components/main-panel/reducers';
import { searchSettings, mapSettings, overlays } from './reducers';

// react-thunk allows
const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);

var reducers = combineReducers({
  locale,
  userLocation,
  panelVisibility,
  overlays,
  mapSettings,
  searchSettings
});


export default function initStore (initialState) {
  return createStoreWithMiddleware(reducers, initialState);
}
