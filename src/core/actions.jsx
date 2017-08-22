import { C, E, helpers, _ } from './';
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

const setZoomHandling = (zoomHandling) => {
  return {
    type: E.SET_ZOOM_HANDLING,
    zoomHandling
  };
};

const setObservationRecency = (recency) => {
  return {
    type: E.SET_SEARCH_OBSERVATION_RECENCY,
    recency
  };
};

const startSearchRequest = (searchType, location, lat, lng, bounds, observationRecency, zoomHandling) => {
  return {
    type: E.SEARCH_REQUEST_STARTED,
    searchType,
    lat,
    lng,
    location,
    bounds,
    observationRecency,
    zoomHandling
  };
};

const initSearchRequest = () => {
  return { type: E.INIT_SEARCH_REQUEST };
};

const searchRequestComplete = () => {
  return { type: E.SEARCH_REQUEST_ENDED };
};


// our one and only search method. This fires off the initial requests for the data. Notable sightings are a single
// request; bird sightings are much more complex.
const search = (searchType, locationString, lat, lng, mapBounds, observationRecency, zoomHandling, showLocationsPanel) => {
  return function (dispatch) {
    dispatch(startSearchRequest(searchType, locationString, lat, lng, mapBounds, observationRecency, zoomHandling));

    const searchParams = {
      lat: lat,
      lng: lng,
      observationRecency: observationRecency
    };

    if (searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.ALL) {

      // this makes a request for the hotspots, converts the results to JSON (which is async for some reason...?) then
      // publishes the appropriate action
      return fetchLocations(searchParams)
        .then(res => res.json())
        .then(
          json  => dispatch(searchLocationsFound(dispatch, json, showLocationsPanel),
          error => dispatch(searchLocationRequestError(dispatch, error))
        )
      );
    }

    // this makes a request for the hotspots, converts the results to JSON (which is async for some reason...?) then
    // publishes the appropriate action
    return fetchNotableSightings(searchParams)
      .then(res => res.json())
      .then(
        json => dispatch(notableResultsReturned(dispatch, json, showLocationsPanel))
      );
  }
};

const searchLocationsFound = (dispatch, locations, showLocationsPanel) => {
  return {
    type: E.SEARCH_LOCATIONS_RETURNED,
    showLocationsPanel,
    success: true,
    locations
  };
};

const searchLocationRequestError = (dispatch, error) => {
  dispatch(searchRequestComplete());
  return {
    type: E.SEARCH_LOCATIONS_RETURNED,
    success: false,
    error: error
  };
};

const notableResultsReturned = (dispatch, data, showLocationsPanel) => {
  var worker = new Worker('./worker-processNotableSightings.js');
  worker.postMessage({
    sightings: data,
    maxSearchDays: C.MISC.MAX_SEARCH_DAYS
  });

  worker.onmessage = function (e) {
    dispatch(storeNotableSightings(e.data.locations, e.data.sightings, showLocationsPanel));
  };
  return {
    type: E.NOTABLE_SEARCH_RETURNED
  };
};

const fetchLocations = (searchParams) => {
  const queryParams = helpers.queryParams(searchParams);
  return fetch('/api/getHotspotLocations?' + queryParams, { method: 'GET' });
};

const fetchNotableSightings = (searchParams) => {
  const queryParams = helpers.queryParams(searchParams);
  return fetch('/api/getNotableSightings?' + queryParams, { method: 'GET' });
};

const setIntroOverlayVisibility = (visible) => {
  return {
    type: E.SET_INTRO_OVERLAY_VISIBILITY,
    visible
  };
};

const storeNotableSightings = (locations, sightings, showLocationsPanel) => {
  return {
    type: E.STORE_NOTABLE_SIGHTINGS,
    showLocationsPanel,
    locations,
    sightings
  };
};

const searchAnywhere = () => {
  return { type: E.SEARCH_ANYWHERE };
};

const clearNextAction = () => {
  return { type: E.CLEAR_NEXT_ACTION };
};

const requestingUserLocation = () => {
  return { type: E.REQUESTING_USER_LOCATION };
};

const requestGeoLocation = (callback) => {
  return function (dispatch) {
    navigator.geolocation.getCurrentPosition(function (position) {
      convertLatLngToAddress(dispatch, position.coords.latitude, position.coords.longitude);
      callback();
    }, function (e) {
      // for whatever reason the geolocation request failed
      dispatch(geoRequestError());
    });
  };
};

const geoRequestError = () => {
  return { type: E.GEO_REQUEST_ERROR };
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
  };
};

const togglePanelVisibility = (panel) => {
  return {
    type: E.TOGGLE_PANEL_VISIBILITY,
    panel: panel
  };
};


// once the visible locations are identified, it automatically requests all observations for them
const visibleLocationsFound = (searchType, visibleLocations, allLocationSightings) => {
  return function (dispatch) {

    if (searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.NOTABLE) {
      dispatch(updateVisibleLocations(visibleLocations));

      if (visibleLocations.length) {
        return dispatch(searchRequestComplete());
      } else {

        // we need to return something to make redux happy, but we're not interested in this event. This occurs when
        // a map's markers are all removed but a request isn't done yet, e.g. when doing a notable search after
        // a regular search was performed.
        return { type: 'NOT_APPLICABLE' };
      }
    }

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

const sortSightings = (sort) => {
  return {
    type: E.SIGHTINGS_SORTED,
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

const showSightingsPanel = () => {
  return { type: E.SHOW_SIGHTINGS_PANEL };
};

const hideSightingsPanel = () => {
  return { type: E.HIDE_SIGHTINGS_PANEL };
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
    filter
  };
};

const selectAboutTab = (tab) => {
  return {
    type: E.SELECT_ABOUT_TAB,
    tab
  };
};

const showModal = () => {
  return { type: E.SHOW_MODAL };
};

const selectSettingsOverlayTab = (tab) => {
  return {
    type: E.SELECT_SETTINGS_OVERLAY_TAB,
    tab
  };
};

const setScientificNameVisibility = (show) => {
  return {
    type: E.SET_SCIENTIFIC_NAME_VISIBILITY,
    show
  };
};

const hideSearchTooltip = (forEntireSession = false) => {
  return {
    type: E.HIDE_SEARCH_TOOLTIP,
    forEntireSession: forEntireSession
  };
};

const clearSearchTooltipVisibility = () => {
  return { type: E.CLEAR_SEARCH_TOOLTIP_VISIBILITY };
};


const selectMapStyle = (mapStyle) => {
  return {
    type: E.SELECT_MAP_STYLE,
    mapStyle
  };
};


const setMapTypeId = (mapTypeId) => {
  return {
    type: E.SELECT_MAP_TYPE_ID,
    mapTypeId
  };
};


export {
  setLocale,
  setSearchLocation,
  setSearchType,
  setZoomHandling,
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
  showSightingsPanel,
  hideSightingsPanel,
  setSpeciesFilter,
  sortSightings,
  searchAnywhere,
  selectAboutTab,
  showModal,
  selectSettingsOverlayTab,
  setScientificNameVisibility,
  clearNextAction,
  hideSearchTooltip,
  clearSearchTooltipVisibility,
  selectMapStyle,
  setMapTypeId
};
