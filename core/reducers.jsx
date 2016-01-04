/*
These just don't seem to belong to the individual components, so I'm going to stick them here and see how things roll.
*/

import { C } from './constants';
import { E } from './events';


function overlays (state = {
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


function searchSettings (state = {
    searchType: 'all',
    location: '',
    lat: null,
    lng: null,
    observationRecency: C.SEARCH_SETTINGS.DEFAULT_SEARCH_DAYS
  }, action) {

  switch (action.type) {
    case E.SET_SEARCH_LOCATION:
      return Object.assign({}, state, {
        location: action.location
      });

    case E.SEARCH_AUTO_COMPLETE:
      return Object.assign({}, state, {
        location: action.location,
        lat: action.lat,
        lng: action.lng
      });
      break;

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
    lng: 0
  }, action) {

  switch (action.type) {
    case E.SEARCH_REQUEST_STARTED:
      return Object.assign({}, state, {
        lat: action.lat,
        lng: action.lng
      });

    default:
      return state;
  }
}


export {
  searchSettings,
  mapSettings,
  overlays
};

