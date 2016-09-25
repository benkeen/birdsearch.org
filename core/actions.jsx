import React from 'react';
import { C, E, helpers, _ } from './core';
import fetch from 'isomorphic-fetch';


const setLocale = (locale) => {
  return {
    type: E.SET_LOCALE,
    locale
  };
};

const setSearchLocation = (location) => {
  return {
    type: E.SET_SEARCH_LOCATION,
    location
  };
};

const setSearchType = (searchType) => {
  return {
    type: E.SET_SEARCH_TYPE,
    searchType
  };
};

const setObservationRecency = (recency) => {
  return {
    type: E.SET_SEARCH_OBSERVATION_RECENCY,
    recency
  };
}

const startSearchRequest = (location, lat, lng, bounds) => {
  return {
    type: E.SEARCH_REQUEST_STARTED,
    lat: lat,
    lng: lng,
    location: location,
    bounds: bounds
  };
};

const initSearchRequest = () => {
  return { type: E.INIT_SEARCH_REQUEST };
};

const searchRequestComplete = () => {
  return { type: E.SEARCH_REQUEST_ENDED };
};

const search = (locationString, lat, lng, mapBounds, limitByObservationRecency, observationRecency) => {
  return function (dispatch) {

    dispatch(startSearchRequest(locationString, lat, lng, mapBounds));

    var searchParams = {
      lat: lat,
      lng: lng,
      limitByObservationRecency: limitByObservationRecency,
      observationRecency: observationRecency
    };

    // this makes a request for the hotspots, converts the results to JSON (which is async for some reason...?) then
    // publishes the appropriate action
    return fetchLocations(searchParams)
      .then(res => res.json())
      .then(
        json  => dispatch(searchLocationsFound(dispatch, json),
        error => dispatch(searchLocationRequestError(dispatch, error))
      )
    );
  }
};

const searchLocationsFound = (dispatch, locations) => {
  return {
    type: E.SEARCH_LOCATIONS_RETURNED,
    success: true,
    locations
  };
}

const searchLocationRequestError = (dispatch, error) => {
  dispatch(searchRequestComplete());
  return {
    type: E.SEARCH_LOCATIONS_RETURNED,
    success: false,
    error: error
  };
};

const fetchLocations = (searchParams) => {
  const queryParams = helpers.queryParams(searchParams);
  return fetch('/api/getHotspotLocations?' + queryParams, { method: 'GET' });
};

const setIntroOverlayVisibility = (visible) => {
  return {
    type: E.SET_INTRO_OVERLAY_VISIBILITY,
    visible
  };
};

const searchAnywhere = () => {
  return { type: E.SEARCH_ANYWHERE };
};

const requestingUserLocation = () => {
  return { type: E.REQUESTING_USER_LOCATION };
};

const requestGeoLocation = (callback) => {
  return function (dispatch) {
    navigator.geolocation.getCurrentPosition(function (position) {
      convertLatLngToAddress(dispatch, position.coords.latitude, position.coords.longitude);
      callback();
    });
  };
};

const convertLatLngToAddress = (dispatch, lat, lng) => {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ latLng: { lat: lat, lng: lng }}, function (results, status) {
    let userLocationFound = false;
    let address = '';
    let bounds = null;
    if (status === google.maps.GeocoderStatus.OK) {
      if (results[1]) {
        userLocationFound = true;
        address = results[1].formatted_address;
        bounds = helpers.getBestBounds(results[1].geometry.viewport, results[1].geometry.bounds);
      }
    }

    dispatch({
      type: E.RECEIVED_USER_LOCATION,
      userLocationFound: userLocationFound,
      lat: lat,
      lng: lng,
      address: address,
      bounds: bounds
    });
  });
};

const getGeoLocation = (callback) => {
  return function (dispatch) {
    dispatch(requestingUserLocation());
    return dispatch(requestGeoLocation(callback));
  }
};

const togglePanelVisibility = (panel) => {
  return {
    type: E.TOGGLE_PANEL_VISIBILITY,
    panel: panel
  };
};

// once the visible locations are identified, it automatically requests all observations for them
const visibleLocationsFound = (visibleLocations, allLocationSightings) => {
  return function (dispatch) {
    dispatch(initSearchRequest());
    dispatch(updateVisibleLocations(visibleLocations));
    return getBirdHotspotObservations(dispatch, visibleLocations, allLocationSightings);
  }
};

const updateVisibleLocations = (visibleLocations) => {
  return {
    type: E.VISIBLE_LOCATIONS_UPDATED,
    locations: visibleLocations
  };
};

const getBirdHotspotObservations = (dispatch, locations, allLocationSightings) => {
  const numLocations = locations.length;

  var updateBundleCount = 1;
  if (numLocations > 60) {
    updateBundleCount = 10;
  } else if (numLocations > 40) {
    updateBundleCount = 8;
  } else if (numLocations > 20) {
    updateBundleCount = 6;
  } else if (numLocations > 10) {
    updateBundleCount = 4;
  } else if (numLocations > 5) {
    updateBundleCount = 2;
  }
  let counter = 0;


  var processHotspotSightingsPacket = function (json, locationIDs) {
    var worker = new Worker('./worker-processHotspotSightings.js'); // TODO shared worker?
    worker.postMessage({
      locationIDs: locationIDs,
      sightings: json,
      maxSearchDays: C.MISC.MAX_SEARCH_DAYS
    });
    worker.onmessage = function (e) {
      dispatch(locationSightingsFound(e.data.locationID, e.data.sightings));
      if (counter % updateBundleCount === 0 || counter === numToFetch-1) {
        dispatch(updateLocationSightings());
      }

      if (counter === numToFetch-1) {
        dispatch(searchRequestComplete());
      }
      counter++;
    };
  };


  // divvy up the requests for the sightings into packets, the size of which depends on the total number of hotspots
  // to query 
  const promises = [];
  const locationIDs = _.filter(locations, (locInfo) => {
    return !allLocationSightings[locInfo.i].fetched;
  }).map((locInfo) => {
    return locInfo.i;
  });

  if (locationIDs.length === 0) {
    console.log('none?');
    dispatch(searchRequestComplete());
    return;
  }

  let numToFetch = locationIDs.length;
  let packetSize = helpers.getPacketSize(locations.length);
  const chunks = helpers.chunkArray(locationIDs, packetSize);

  chunks.forEach((locationIDs) => {
    promises.push(fetchHotspotSightingsPacket(locationIDs)
      .then(res => res.json())
      .then(json => processHotspotSightingsPacket(json, locationIDs)
        //error => dispatch(searchLocationRequestError(dispatch, error))
    ));
  });

  return promises;
};

const fetchHotspotSightingsPacket = (locationIDs) => {
  return fetch(`/api/getHotspotSightingsPacket?locationIDs=${locationIDs.join(',')}&recency=30`, { method: 'GET' });
};

const locationSightingsFound = (locationID, resp) => {
  return {
    type: E.HOTSPOT_SIGHTINGS_RETURNED,
    locationID: locationID,
    sightings: resp
  };
};

const updateLocationSightings = () => {
  return { type: E.HOTSPOT_SIGHTINGS_UPDATE }
};

const onWindowResize = (width, height) => {
  return {
    type: E.WINDOW_RESIZED,
    width: width,
    height: height
  }
};

const sortLocations = (sort) => {
  return {
    type: E.LOCATIONS_SORTED,
    sort: sort
  }
};

const sortSpecies = (sort) => {
  return {
    type: E.SPECIES_SORTED,
    sort: sort
  }
};

const selectLocation = (location) => {
  return {
    type: E.LOCATION_SELECTED,
    location: location
  }
};

const hideLocationsPanel = () => {
  return { type: E.HIDE_LOCATIONS_PANEL };
};

const showSpeciesPanel = () => {
  return { type: E.SHOW_SPECIES_PANEL };
};

const hideSpeciesPanel = () => {
  return { type: E.HIDE_SPECIES_PANEL };
};

const setLocationFilter = (filter) => {
  return {
    type: E.SET_LOCATION_FILTER,
    filter: filter
  };
};

const setSpeciesFilter = (filter) => {
  return {
    type: E.SET_SPECIES_FILTER,
    filter: filter
  };
};

const selectAboutTab = (tab) => {
  return {
    type: E.SELECT_ABOUT_TAB,
    tab: tab
  };
};


const showModal = () => {
  return { type: E.SHOW_MODAL };
};


export {
  setLocale,
  setSearchLocation,
  setSearchType,
  setObservationRecency,
  search,
  setIntroOverlayVisibility,
  getGeoLocation,
  togglePanelVisibility,
  visibleLocationsFound,
  onWindowResize,
  sortLocations,
  hideLocationsPanel,
  setLocationFilter,
  selectLocation,
  showSpeciesPanel,
  hideSpeciesPanel,
  setSpeciesFilter,
  sortSpecies,
  searchAnywhere,
  selectAboutTab,
  showModal
};
