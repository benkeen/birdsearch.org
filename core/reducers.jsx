/*
These just don't seem to belong to the individual components, so I'm going to stick them here and see how things roll.
*/

import { C } from './constants';
import { E } from './events';
import * as storage from './storage';


function locale (state = C.DEFAULT_LOCALE, action) {
  switch (action.type) {
    case E.SET_LOCALE:
      storage.set('locale', action.locale);
      return action.locale;
    default:
      return state;
  }
}


function searchSettings (state = {
    searchType: 'all',
    location: '',
    lat: null,
    lng: null,
    limitByObservationRecency: false,
    observationRecency: C.SEARCH_SETTINGS.DEFAULT_SEARCH_DAYS
  }, action) {

  switch (action.type) {
    case E.SET_SEARCH_LOCATION:
      return Object.assign({}, state, {
        location: action.location
      });

    case E.RECEIVED_USER_LOCATION:
      // if an address was included, it means Google was able to reverse geocode the lat/lng into an intelligible
      // address. Favour that over the raw lat/lng, which is kinda klutzy to see in the UI
      var location = (action.address) ? action.address : action.lat + ',' + action.lng;

      return Object.assign({}, state, {
        location: location,
        lat: action.lat,
        lng: action.lng
      });

    default:
      return state;
  }
}


function mapSettings (state = {
    zoom: 3,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    lat: 30,
    lng: 0,
    bounds: null
  }, action) {

  switch (action.type) {
    case E.SEARCH_REQUEST_STARTED:
      return Object.assign({}, state, {
        lat: action.lat,
        lng: action.lng,
        bounds: action.bounds
      });
      break;

    case E.RECEIVED_USER_LOCATION:
      return Object.assign({}, state, {
        lat: action.lat,
        lng: action.lng,
        bounds: action.bounds
      });
      break;

    default:
      return state;
  }
}


function overlayVisibility (state = {
  intro: true,
  advancedSearch: false
}, action) {

  switch (action.type) {
    case E.SET_INTRO_OVERLAY_VISIBILITY:
      return Object.assign({}, state, {
        intro: action.visible
      });

    // after a user's location is found, hide the Intro overlay
    case E.RECEIVED_USER_LOCATION:
      return Object.assign({}, state, {
        intro: false
      });

    case E.SET_ADVANCED_SEARCH_VISIBILITY:
      return Object.assign({}, state, {
        advancedSearch: action.visible
      });

    default:
      return state;
  }
}


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
    case E.REQUESTING_USER_LOCATION:
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
      settings[panel] = !state[panel];
      return Object.assign({}, state, settings);

    case E.SEARCH_LOCATIONS_RETURNED:
      return Object.assign({}, state, {
        overview: true,
        locations: true
      });
    break;

    default:
      return state
  }
}


function results (state = {
  isFetching: false,
  numLocations: 0,
  allLocations: [], // stores every
  visibleLocations: []
}, action) {
  switch (action.type) {
    case E.SEARCH_REQUEST_ENDED:
      return Object.assign({}, state, {
        isFetching: false
      });

    case E.SEARCH_LOCATIONS_RETURNED:
      return Object.assign({}, state, {
        allLocations: action.locations
      });
    break;

    default:
      return state;
  }
}

export {
  locale,
  searchSettings,
  mapSettings,
  userLocation,
  overlayVisibility,
  panelVisibility,
  results
};

