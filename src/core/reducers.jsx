/*
I found that for an app of this size, grouping all reducers into a single location here
is the clearest way to organize the code.
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


function searchSettings (state = {
    searchType: C.SEARCH_SETTINGS.SEARCH_TYPES.ALL,
    location: '',
    lat: null,
    lng: null,
    observationRecency: null,
    zoomHandling: null
  }, action) {

  switch (action.type) {
    case E.SET_SEARCH_LOCATION:
      return Object.assign({}, state, {
        location: action.location
      });

    // when a request is started, the action passes the latest & greatest settings from the settings overlay modal
    // (search type, observation recency, zoom handling). This ensures the main search settings ONLY reflect those
    // values upon an actual search
    case E.SEARCH_REQUEST_STARTED:
      return Object.assign({}, state, {
        searchType: action.searchType,
        location: action.location,
        lat: action.lat,
        lng: action.lng,
        observationRecency: action.observationRecency,
        zoomHandling: action.zoomHandling
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
    mapTypeId: C.DEFAULT_MAP_TYPE,
    lat: 30,
    lng: 0,
    bounds: null,
    searchUpdateCounter: 0,
    resetSearchCounter: 0
  }, action) {

  switch (action.type) {
    case E.SEARCH_REQUEST_STARTED:
      return Object.assign({}, state, {
        lat: action.lat,
        lng: action.lng,
        bounds: action.bounds,
        searchUpdateCounter: state.searchUpdateCounter + 1,
        resetSearchCounter: state.resetSearchCounter + 1
      });

    case E.RECEIVED_USER_LOCATION:
      return Object.assign({}, state, {
        lat: action.lat,
        lng: action.lng,
        bounds: action.bounds,
        searchUpdateCounter: state.searchUpdateCounter + 1
      });

    case E.SET_MAP_TYPE:
      storage.set('locale', action.mapType);
      return Object.assign({}, state, {
        mapType: action.mapType
      });

    case E.WINDOW_RESIZED:
    case E.HOTSPOT_SIGHTINGS_UPDATE:
    case E.SET_LOCATION_FILTER:
    case E.STORE_NOTABLE_SIGHTINGS:
    case E.SEARCH_LOCATIONS_RETURNED:
      return Object.assign({}, state, {
        searchUpdateCounter: state.searchUpdateCounter + 1
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
  address: '',
  locale: C.DEFAULT_LOCALE
}, action) {
  switch (action.type) {
    case E.REQUESTING_USER_LOCATION:
      return Object.assign({}, state, { isFetching: true });

    case E.RECEIVED_USER_LOCATION:
      return Object.assign({}, state, {
        isFetching: false,
        userLocationFound: action.userLocationFound,
        lat: action.lat,
        lng: action.lng,
        address: action.address
      });

    case E.SET_LOCALE:
      storage.set('locale', action.locale);
      return Object.assign({}, state, {
        locale: action.locale
      });

    default:
      return state;
  }
}


function introOverlay (state = {
  visible: true,

  // the intro overlay is special: it has it's own /intro route, but it automatically shows up when the user first
  // goes to the root with no route change. To know when NOT to automatically show it, we track when the overlay is
  // first closed
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


function aboutOverlay (state = {
  selectedTab: C.ABOUT_TABS.ABOUT
}, action) {

  switch (action.type) {
    case E.SELECT_ABOUT_TAB:
      return Object.assign({}, state, {
        selectedTab: action.tab
      });
    default:
      return state;
  }
}


// the search settings overlay has its own copy of the actual search settings. This allows the user to change settings
// there and not have them immediately effect the rest of the UI. Only after a search is performed do the settings
// get copied over to searchSettings
function settingsOverlay (state = {
  selectedTab: C.SEARCH_OVERLAY_TABS.SEARCH_SETTINGS,
  searchType: null,
  observationRecency: null,
  zoomHandling: null,
  showScientificName: false
}, action) {

  switch (action.type) {
    case E.SELECT_SETTINGS_OVERLAY_TAB:
      return Object.assign({}, state, {
        selectedTab: action.tab
      });

    case E.SET_SEARCH_OBSERVATION_RECENCY:
      storage.set('obsRecency', action.recency);
      return Object.assign({}, state, {
        observationRecency: action.recency
      });

    case E.SET_SEARCH_TYPE:
      storage.set('searchType', action.searchType);
      return Object.assign({}, state, {
        searchType: action.searchType
      });

    case E.SET_ZOOM_HANDLING:
      storage.set('zoomHandling', action.zoomHandling);
      return Object.assign({}, state, {
        zoomHandling: action.zoomHandling
      });

    case E.SET_SCIENTIFIC_NAME_VISIBILITY:
      storage.set('showScientificName', action.show ? 1 : 0);
      return Object.assign({}, state, {
        showScientificName: action.show
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

  // stores all locations currently visible on the user's map. N.B. this may include locations that have been
  // hidden by entering a location filter string
  visibleLocations: [],
  locationSightings: {}, // an object of [location ID] => sighting info. Populated as need be, based on what's visible

  searchError: ''
}, action) {
  switch (action.type) {
    case E.SEARCH_REQUEST_STARTED:
      return Object.assign({}, state, {
        allLocations: [],
        visibleLocations: [],
        locationSightings: {},
        isFetching: true,
        searchError: ''
      });

    case E.INIT_SEARCH_REQUEST:
      return Object.assign({}, state, {
        isFetching: true
      });

    case E.SEARCH_REQUEST_ENDED:
      return Object.assign({}, state, {
        isFetching: false
      });

    case E.SEARCH_LOCATIONS_RETURNED:
      var locationSightings = Object.assign({}, state.locationSightings);

      let searchError = '';
      if (action.locations.length === 0) {
        searchError = 'noResultsFound';
      }
      action.locations.forEach(function (locInfo) {
        locationSightings[locInfo.i] = {
          fetched: false,
          data: []
        }
      });

      return Object.assign({}, state, {
        isFetching: (action.locations.length === 0 || !action.success) ? false : state.isFetching,
        allLocations: action.locations,
        locationSightings: locationSightings,
        searchError: searchError
      });

    case E.HOTSPOT_SIGHTINGS_RETURNED:
      var locationSightings = Object.assign({}, state.locationSightings);
      locationSightings[action.locationID] = {
        fetched: true,
        data: action.sightings
      };
      return Object.assign({}, state, {
        locationSightings: locationSightings
      });

    case E.STORE_NOTABLE_SIGHTINGS:
      var locationSightings = {};
      _.each(action.sightings, (sightings, locationID) => {
        locationSightings[locationID] = {
          fetched: true,
          data: sightings
        }
      });
      return Object.assign({}, state, {
        isFetching: false,
        allLocations: action.locations,
        locationSightings: locationSightings
      });

    case E.VISIBLE_LOCATIONS_UPDATED:
      return Object.assign({}, state, {
        visibleLocations: action.locations
      });

    default:
      return state;
  }
}


function locationsPanel (state = {
  visible: false,
  updateCounter: 0,
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
        sortDir: newSort,
        updateCounter: state.updateCounter+1
      });

    case E.TOGGLE_PANEL_VISIBILITY:
      var newVisibility = state.visible;
      var updateCounter = state.updateCounter;
      if (action.panel === C.PANELS.LOCATIONS) {
        newVisibility = !newVisibility;
        updateCounter = updateCounter+1;
      }
      return Object.assign({}, state, {
        visible: newVisibility,
        updateCounter: updateCounter
      });

    case E.HIDE_LOCATIONS_PANEL:
      return Object.assign({}, state, {
        visible: false,
        updateCounter: state.updateCounter+1
      });

    case E.SEARCH_LOCATIONS_RETURNED:
    case E.STORE_NOTABLE_SIGHTINGS:
      return Object.assign({}, state, {
        visible: true,
        updateCounter: state.updateCounter+1
      });

    case E.SET_LOCATION_FILTER:
      return Object.assign({}, state, {
        filter: action.filter,
        updateCounter: state.updateCounter+1
      });

    case E.LOCATION_SELECTED:
      return Object.assign({}, state, {
        selectedLocation: action.location,
        updateCounter: state.updateCounter+1
      });

    case E.SHOW_MODAL:
      return Object.assign({}, state, { visible: false, updateCounter: state.updateCounter+1 });

    case E.SEARCH_REQUEST_STARTED:
      return Object.assign({}, state, {
        filter: '',
        selectedLocation: '',
        updateCounter: state.updateCounter+1
      });

    case E.SET_LOCALE:
    case E.SEARCH_REQUEST_ENDED:
    case E.HOTSPOT_SIGHTINGS_UPDATE:
    case E.VISIBLE_LOCATIONS_UPDATED:
    case E.WINDOW_RESIZED:
      return Object.assign({}, state, { updateCounter: state.updateCounter+1 });

    default:
      return state;
  }
}


function sightingsPanel (state = {
  visible: false,
  filter: '',
  updateCounter: 0,
  sort: C.SIGHTINGS_SORT.FIELDS.SPECIES,
  sortDir: C.SORT_DIR.DEFAULT
}, action) {

  switch (action.type) {
    case E.TOGGLE_PANEL_VISIBILITY:
      var newVisibility = state.visible;
      var updateCounter = state.updateCounter;
      if (action.panel === C.PANELS.SPECIES) {
        newVisibility = !newVisibility;
        updateCounter = updateCounter+1;
      }
      return Object.assign({}, state, {
        visible: newVisibility,
        updateCounter: updateCounter
      });

    case E.SIGHTINGS_SORTED:
      var newSort = C.SORT_DIR.DEFAULT;
      if (state.sort === action.sort) {
        if (state.sortDir === C.SORT_DIR.DEFAULT) {
          newSort = C.SORT_DIR.REVERSE;
        }
      }
      return Object.assign({}, state, {
        sort: action.sort,
        sortDir: newSort,
        updateCounter: state.updateCounter+1
      });

    case E.SHOW_SIGHTINGS_PANEL:
      return Object.assign({}, state, { visible: true, updateCounter: state.updateCounter+1 });

    case E.HIDE_SIGHTINGS_PANEL:
      return Object.assign({}, state, { visible: false, updateCounter: state.updateCounter+1 });

    case E.SET_SPECIES_FILTER:
      return Object.assign({}, state, {
        filter: action.filter,
        updateCounter: state.updateCounter+1
      });

    case E.SHOW_MODAL:
      return Object.assign({}, state, { visible: false, updateCounter: state.updateCounter+1 });

    case E.SET_LOCALE:
    case E.LOCATION_SELECTED:
    case E.SEARCH_REQUEST_STARTED:
    case E.SEARCH_REQUEST_ENDED:
    case E.WINDOW_RESIZED:
    case E.SET_SCIENTIFIC_NAME_VISIBILITY:
      return Object.assign({}, state, { updateCounter: state.updateCounter+1 });

    default:
      return state;
  }
}


// this is a weird one - react really fails to handle certain scenarios well. e.g. close a modal and focus on some
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

    default:
      return state;
  }
}


export {
  env,
  searchSettings,
  mapSettings,
  user,
  results,
  locationsPanel,
  sightingsPanel,
  introOverlay,
  aboutOverlay,
  settingsOverlay,
  misc
};
