import thunk from 'redux-thunk';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { locale, searchSettings, mapSettings, overlayVisibility, userLocation, panelVisibility } from './reducers';

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);


var reducers = combineReducers({
  locale,
  userLocation,
  panelVisibility,
  overlayVisibility,
  mapSettings,
  searchSettings
});

export default function initStore (initialState) {
  return createStoreWithMiddleware(reducers, initialState);
}
