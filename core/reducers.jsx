/*
These just don't seem to belong to the individual components, so I'm going to stick them here and see how things roll.
*/

import { C, E, _, helpers, actions } from './core';
import * as storage from './storage';



function env (state = {
  windowWidth: $(window).width(),
  windowHeight: $(window).height()
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


// these are any settings that are stored in local storage for any public user
function storedSettings (state = {
  locale: C.DEFAULT_LOCALE,
  mapType: C.DEFAULT_MAP_TYPE
}, action) {
  switch (action.type) {
    case E.SET_LOCALE:
      storage.set('locale', action.locale);
      return Object.assign({}, state, {
        locale: action.locale
      });

    case E.SET_MAP_TYPE:
      storage.set('locale', action.mapType);
      return Object.assign({}, state, {
        mapType: action.mapType
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
        location: action.location,
        lat: action.lat,
        lng: action.lng
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
    bounds: null,
    searchCounter: 0
  }, action) {

  switch (action.type) {
    case E.SEARCH_REQUEST_STARTED:
      return Object.assign({}, state, {
        lat: action.lat,
        lng: action.lng,
        bounds: action.bounds,
        searchCounter: state.searchCounter + 1
      });
      break;

    case E.RECEIVED_USER_LOCATION:
      return Object.assign({}, state, {
        lat: action.lat,
        lng: action.lng,
        bounds: action.bounds,
        searchCounter: state.searchCounter + 1
      });
      break;

    case E.WINDOW_RESIZED:
    case E.HOTSPOT_SIGHTINGS_UPDATE:
    case E.SEARCH_LOCATIONS_RETURNED:
      return Object.assign({}, state, {
        searchCounter: state.searchCounter + 1
      });
      break;

    default:
      return state;
  }
}


function introOverlay (state = {
  visible: true,

  // the intro overlay is special: it has it's own /intro route, but it automatically shows up when the user first
  // goes to the root. To know when NOT to automatically show it, we track when the overlay is first closed
  hasBeenClosedAtLeastOnce: false
}, action) {

  switch (action.type) {
    case E.SET_INTRO_OVERLAY_VISIBILITY:

      const data = {
        visible: action.visible
      };
      if (!action.visible) {
        data.hasBeenClosedAtLeastOnce = true;
      }
      return Object.assign({}, state, data);

    // after a user's location is found, hide the Intro overlay
    case E.RECEIVED_USER_LOCATION:
      return Object.assign({}, state, {
        visible: false
      });

    default:
      return state;
  }
}

function advancedSearchOverlay (state = {
  visible: false
}, action) {

  switch (action.type) {
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


function results (state = {
  isFetching: false,
  numLocations: 0,

  // stores all locations returned from the last search. These may well include locations outside the visible
  // map boundaries
  allLocations: [],

  // stores all locations currently visible on the user's map. 
  visibleLocations: [],

  locationSightings: {}, // an object of [location ID] => sighting info. Populated as need be, based on what's visible

  // a simple way to announce that the location data has changed. This allows components to have a simple integer to compare
  // against to know when it should update
  visibleLocationsReturnedCounter: 0,
  locationDataRefreshCounter: 0

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
      locationSightings[action.locationID] = {
        fetched: true,
        data: action.sightings
      };
      return Object.assign({}, state, {
        locationSightings: locationSightings
      });
      break;

    case E.HOTSPOT_SIGHTINGS_UPDATE:
      return Object.assign({}, state, {
        locationDataRefreshCounter: state.locationDataRefreshCounter + 1
      });
      break;

    case E.VISIBLE_LOCATIONS_UPDATED:
      return Object.assign({}, state, {
        visibleLocations: action.locations,
        visibleLocationsReturnedCounter: state.visibleLocationsReturnedCounter + 1
      });
      break;

    case E.SET_LOCATION_FILTER:
      return Object.assign({}, state, {
        locationDataRefreshCounter: state.locationDataRefreshCounter + 1
      });
      break;

    default:
      return state;
  }
}


function locationsPanel (state = {
  visible: false,
  sort: C.LOCATION_SORT.FIELDS.LOCATION,
  sortDir: C.SORT_DIR.DEFAULT,
  filter: '',
  selectedLocation: ''
}, action) {

  switch (action.type) {
    case E.LOCATIONS_SORTED:
      var newSort = C.SORT_DIR.DEFAULT;
      if (state.sort === action.sort) {
        if (state.sortDir === C.SORT_DIR.DEFAULT) {
          newSort = C.SORT_DIR.REVERSE;
        }
      }
      return Object.assign({}, state, {
        sort: action.sort,
        sortDir: newSort
      });
      break;

    case E.TOGGLE_PANEL_VISIBILITY:
      var newVisibility = state.visible;
      if (action.panel === C.PANELS.LOCATIONS) {
        newVisibility = !newVisibility;
      }
      return Object.assign({}, state, {
        visible: newVisibility
      });

    case E.HIDE_LOCATIONS_PANEL:
      return Object.assign({}, state, { visible: false });

    case E.SEARCH_LOCATIONS_RETURNED:
      return Object.assign({}, state, {
        visible: true
      });

    case E.SET_LOCATION_FILTER:
      return Object.assign({}, state, {
        filter: action.filter
      });

    case E.LOCATION_SELECTED:
      return Object.assign({}, state, {
        selectedLocation: action.location
      });

    default:
      return state;
  }
}


function speciesPanel (state = {
  visible: false,
  filter: '',
  sort: C.SPECIES_SORT.FIELDS.SPECIES,
  sortDir: C.SORT_DIR.DEFAULT
}, action) {

  switch (action.type) {
    case E.TOGGLE_PANEL_VISIBILITY:
      var newVisibility = state.visible;
      if (action.panel === C.PANELS.SPECIES) {
        newVisibility = !newVisibility;
      }
      return Object.assign({}, state, {
        visible: newVisibility
      });

    case E.SPECIES_SORTED:
      var newSort = C.SORT_DIR.DEFAULT;
      if (state.sort === action.sort) {
        if (state.sortDir === C.SORT_DIR.DEFAULT) {
          newSort = C.SORT_DIR.REVERSE;
        }
      }
      return Object.assign({}, state, {
        sort: action.sort,
        sortDir: newSort
      });
      break;

    case E.SHOW_SPECIES_PANEL:
      return Object.assign({}, state, { visible: true });

    case E.HIDE_SPECIES_PANEL:
      return Object.assign({}, state, { visible: false });

    case E.SET_SPECIES_FILTER:
      return Object.assign({}, state, {
        filter: action.filter
      });
      break;

    default:
      return state;
  }
}


// this is a weird one. React really fails to handle scenarios like this well. e.g. close a modal and focus on some
// arbitrary input field in a different component somewhere. We need a one-off message sent to do a thing. This section
// handles that.
function misc (state = {
  nextAction: ''
}, action) {

  switch (action.type) {
    case E.SEARCH_ANYWHERE:
      return Object.assign({}, state, {
        nextAction: C.ONE_OFFS.MAIN_SEARCH_FIELD_FOCUS
      });
      break;

    default:
      return state;
  }
}

export {
  env,
  storedSettings,
  searchSettings,
  mapSettings,
  user,
  results,
  locationsPanel,
  speciesPanel,
  misc,
  introOverlay,
  advancedSearchOverlay
};
