import { createStore, combineReducers } from 'redux';
import { locale } from '../components/header/reducers';
import { introOverlayVisible, isRequestingUserLocation} from '../components/main-panel/reducers';
import { sidebarVisible } from '../components/sidebar/reducers';

var reducers = combineReducers({
  locale,
  sidebarVisible,
  introOverlayVisible,
  isRequestingUserLocation
});

export default function initStore (initialState) {
  return createStore(reducers, initialState);
}
