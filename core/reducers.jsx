/*
These just don't seem to belong to the individual components, so I'm going to stick them here and see how things roll.
*/

import { C, E, _, helpers, actions } from './core';
import * as storage from './storage';



function env (state = {
  windowWidth: null,
  windowHeight: null
}, action) {
  switch (action.type) {
    case E.WINDOW_RESIZED:
      return Object.assign({}, state, {
        windowWidth: action.width,
        windowHeight: action.height
      });

    default:
      return state;
  }
}


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
    limitByObservationRecency: true,
    observationRecency: C.SEARCH_SETTINGS.DEFAULT_SEARCH_DAYS
  }, action) {

  switch (action.type) {
    case E.SET_SEARCH_LOCATION:
      return Object.assign({}, state, {
        location: action.location
      });

    case E.SEARCH_REQUEST_STARTED:
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


function user (state = {
  isFetching: false,
  userLocationFound: false,
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
        userLocationFound: action.userLocationFound,
        lat: action.lat,
        lng: action.lng,
        address: action.address
      });
    default:
      return state;
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
      return state;
  }
}


function results (state = {
  isFetching: false,
  numLocations: 0,
  allLocations: [], // stores everything from the last search
  visibleLocations: [], // stores all locations currently visible on the user's map
  locationSightings: {} // an object of [location ID] => sighting info. Populated as need be, based on what's visible
}, action) {
  switch (action.type) {
    case E.SEARCH_REQUEST_ENDED:
      return Object.assign({}, state, {
        isFetching: false
      });
      break;

    case E.SEARCH_LOCATIONS_RETURNED:
      var locationSightings = Object.assign({}, state.locationSightings);
      action.locations.forEach(function (locInfo) {
        locationSightings[locInfo.i] = {
          fetched: false,
          data: []
        }
      });
      return Object.assign({}, state, {
        allLocations: action.locations,
        locationSightings: locationSightings
      });
      break;

    case E.HOTSPOT_SIGHTINGS_RETURNED:
      var locationSightings = Object.assign({}, state.locationSightings);
      var parsedData = helpers.parseHotspotSightings(action.sightings);
      locationSightings[action.locationID] = {
        fetched: true,
        data: parsedData
      };
      console.log(action.locationID, parsedData);
      return Object.assign({}, state, {
        locationSightings: locationSightings
      });
      break;

    case E.VISIBLE_LOCATIONS_UPDATED:
      console.log("visible locations updated: ", action.locations.length);
      return Object.assign({}, state, {
        visibleLocations: action.locations
      });
      break;

    default:
      return state;
  }
}

export {
  env,
  locale,
  searchSettings,
  mapSettings,
  user,
  overlayVisibility,
  panelVisibility,
  results
};

