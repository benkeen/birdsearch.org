import { C } from '../../core/constants';
import { E } from '../../core/events';
import * as storage from '../../core/storage';


/**
 * Reminder: this adds an object property to the redux store with the following shape:
 *
 * userLocation: {
 *    isFetching: ...,
 *    reverseGeocodeSuccess: ...,
 *    lat: ...,
 *    lng: ...',
 *    address: ...
 * }
 */
function userLocation (state = {
  isFetching: false,
  reverseGeocodeSuccess: false,
  lat: null,
  lng: null,
  address: ''
}, action) {
  switch (action.type) {
    case E.REQUEST_USER_LOCATION:
      return Object.assign({}, state, { isFetching: true });
    break;

    case E.RECEIVED_USER_LOCATION:
      return Object.assign({}, state, {
        isFetching: false,
        reverseGeocodeSuccess: action.reverseGeocodeSuccess,
        lat: action.lat,
        lng: action.lng,
        address: action.address
      });
    default:
      return state
  }
}

function panelVisibility (state = {
  overview: false,
  locations: false,
  species: false
}, action) {
  switch (action.type) {
    case E.TOGGLE_PANEL_VISIBILITY:
      var panel = action.panel;
      var settings = {};
      settings[panel] = !settings[panel];
      return Object.assign({}, state, settings);
    default:
      return state
  }
}

export {
  userLocation,
  panelVisibility
};
