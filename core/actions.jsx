import React from 'react';
import { C, E, helpers, _ } from './core';
import fetch from 'isomorphic-fetch';


function setLocale (locale) {
  return {
    type: E.SET_LOCALE,
    locale
  };
}

function setSearchLocation (location) {
  return {
    type: E.SET_SEARCH_LOCATION,
    location
  };
}

function startSearchRequest (location, lat, lng, bounds) {
  return {
    type: E.SEARCH_REQUEST_STARTED,
    lat: lat,
    lng: lng,
    location: location,
    bounds: bounds
  };
}

function searchRequestComplete () {
  return { type: E.SEARCH_REQUEST_ENDED };
}


function search (locationString, lat, lng, mapBounds, limitByObservationRecency, observationRecency) {
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
}

function searchLocationsFound (dispatch, locations) {
  dispatch(searchRequestComplete());
  return {
    type: E.SEARCH_LOCATIONS_RETURNED,
    success: true,
    locations
  };
}

function searchLocationRequestError (dispatch, error) {
  dispatch(searchRequestComplete());
  return {
    type: E.SEARCH_LOCATIONS_RETURNED,
    success: false,
    error: error
  };
}

function fetchLocations (searchParams) {
  const queryParams = helpers.queryParams(searchParams);
  return fetch('/api/getHotspotLocations?' + queryParams, { method: 'GET' });
}

function setIntroOverlayVisibility (visible) {
  return {
    type: E.SET_INTRO_OVERLAY_VISIBILITY,
    visible
  };
}

function searchAnywhere () {
  return { type: E.SEARCH_ANYWHERE };
}

function requestingUserLocation () {
  return { type: E.REQUESTING_USER_LOCATION };
}

function requestGeoLocation (callback) {
  return function (dispatch) {
    navigator.geolocation.getCurrentPosition(function (position) {
      convertLatLngToAddress(dispatch, position.coords.latitude, position.coords.longitude);
      callback();
    });
  };
}

function convertLatLngToAddress (dispatch, lat, lng) {
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
}


function getGeoLocation (callback) {
  return function (dispatch) {
    dispatch(requestingUserLocation());
    return dispatch(requestGeoLocation(callback));
  }
}

function togglePanelVisibility (panel) {
  return {
    type: E.TOGGLE_PANEL_VISIBILITY,
    panel: panel
  };
}

// once the visible locations are identified, it automatically requests all observations for them
function visibleLocationsFound (visibleLocations, allLocationSightings) {
  return function (dispatch) {
    dispatch(updateVisibleLocations(visibleLocations));
    return getBirdHotspotObservations(dispatch, visibleLocations, allLocationSightings);
  }
}

function updateVisibleLocations (visibleLocations) {
  return {
    type: E.VISIBLE_LOCATIONS_UPDATED,
    locations: visibleLocations
  };
}

function getBirdHotspotObservations (dispatch, locations, allLocationSightings) {
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


//  var processHotspotSightings = function (json, currLocationID) {
//    var worker = new Worker('./processHotspotSightingsPacket.js'); // TODO shared worker?
//    worker.postMessage({
//      locationID: currLocationID,
//      sightings: json,
//      maxSearchDays: C.MISC.MAX_SEARCH_DAYS
//    });
//    worker.onmessage = function (e) {
//      dispatch(locationSightingsFound(e.data.locationID, e.data.sightings));
//      if (counter % updateBundleCount === 0 || counter === numLocations-1) {
//        dispatch(updateLocationSightings());
//      }
//      counter++;
//    };
//  };

  var processHotspotSightingsPacket = function (json, locationIDs) {
    var worker = new Worker('./worker-processHotspotSightings.js'); // TODO shared worker?
    worker.postMessage({
      locationIDs: locationIDs,
      sightings: json,
      maxSearchDays: C.MISC.MAX_SEARCH_DAYS
    });
    worker.onmessage = function (e) {
      dispatch(locationSightingsFound(e.data.locationID, e.data.sightings));
      if (counter % updateBundleCount === 0 || counter === numLocations-1) {
        dispatch(updateLocationSightings());
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
}

const fetchSingleHotspotSightings = (locationID) => {
  return fetch(`/api/getHotspotSightings?locationID=${locationID}&recency=30`, { method: 'GET' });
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

const updateLocationSightings = function () {
  return { type: E.HOTSPOT_SIGHTINGS_UPDATE }
};

const onWindowResize = function (width, height) {
  return {
    type: E.WINDOW_RESIZED,
    width: width,
    height: height
  }
};

const sortLocations = function (sort) {
  return {
    type: E.LOCATIONS_SORTED,
    sort: sort
  }
};

const sortSpecies = function (sort) {
  return {
    type: E.SPECIES_SORTED,
    sort: sort
  }
};

const selectLocation = function (location) {
  return {
    type: E.LOCATION_SELECTED,
    location: location
  }
};

const hideLocationsPanel = function () {
  return { type: E.HIDE_LOCATIONS_PANEL };
};

const showSpeciesPanel = function () {
  return { type: E.SHOW_SPECIES_PANEL };
};

const hideSpeciesPanel = function () {
  return { type: E.HIDE_SPECIES_PANEL };
};

const setLocationFilter = function (filter) {
  return {
    type: E.SET_LOCATION_FILTER,
    filter: filter
  };
};

const setSpeciesFilter = function (filter) {
  return {
    type: E.SET_SPECIES_FILTER,
    filter: filter
  };
};


export {
  setLocale,
  setSearchLocation,
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
  searchAnywhere
};
