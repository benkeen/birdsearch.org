import React from 'react';
import ReactDOM from 'react-dom';
import { C, E } from './core';


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

function startSearchRequest (searchSettings) {
  console.log("start search request");

  dispatch(search(searchSettings));
  return {
    type: E.SEARCH_REQUEST_STARTED,
    lat: searchSettings.lat,
    lng: searchSettings.lng
  };
}

function searchRequestComplete () {
  return { type: E.SEARCH_REQUEST_ENDED };
}

function search (searchSettings) {
  return function (dispatch) {
    return fetchBirdSightings(searchSettings).then(
      locations => dispatch(searchLocationsFound(dispatch, location)),
      error     => dispatch(searchLocationRequestError(dispatch, error))
    );
  }
}

function searchAutoComplete (info) {
  //dispatch(startSearchRequest(searchSettings));
  return {
    type: E.SEARCH_AUTO_COMPLETE,
    location: info.location,
    lat: info.lat,
    lng: info.lng
  };
}

function searchLocationsFound (dispatch, locations) {
  dispatch(searchRequestComplete());
  return {
    type: E.SEARCH_LOCATIONS_RETURNED,
    locations
  };
}

function searchLocationRequestError (dispatch, error) {
  dispatch(searchRequestComplete());
  console.log("error: ", error);
}

/**
 * Searches a region for bird sightings.
var _getBirdSightings = function(searchParams) {
  $.ajax({
    url: "ajax/getHotspotLocations.php",
    data: searchParams,
    type: "POST",
    dataType: "json",
    success: function(response) {

      _data.all.lastSearch = dataCache.formatHotspotData(response);
      _clearHotspots();

      // this adds as many as possible to the map - but many may be out of bounds.
      _addMarkers("all", _data.all.lastSearch);
      _searchStarted = false;
      helper.stopLoading();

      mediator.publish(_MODULE_ID, C.EVENT.MAP.BIRD_MARKERS_ADDED, {
        locations: _visibleHotspots,
        lastSearchObservationRecency: _lastSearch.observationRecency
      });

    },
    error: function(response) {
      helper.stopLoading();
    }
  });
};
*/


function fetchBirdSightings (searchParams) {
  return fetch('/birdsearch.org/ajax/getHotspotLocations.php', {
    method: 'POST',
    body: JSON.stringify(searchParams)
  });
}


function setIntroOverlayVisibility (visible) {
  return {
    type: E.SET_INTRO_OVERLAY_VISIBILITY,
    visible
  };
}

function requestUserLocation () {
  return { type: E.REQUEST_USER_LOCATION };
}

function requestGeoLocation () {
  return function (dispatch) {
    navigator.geolocation.getCurrentPosition(function (position) {
      convertLatLngToAddress(dispatch, position.coords.latitude, position.coords.longitude);
    });
  };
}

function convertLatLngToAddress (dispatch, lat, lng) {
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ latLng: { lat: lat, lng: lng }}, function (results, status) {
    var reverseGeocodeSuccess = false;
    var address = '';
    var bounds = null;
    if (status === google.maps.GeocoderStatus.OK) {
      if (results[1]) {
        reverseGeocodeSuccess = true;
        address = results[1].formatted_address;
        bounds = helpers.getBestBounds(results[1].geometry.viewport, results[1].geometry.bounds);
      }
    }

    dispatch();

    dispatch({
      type: E.RECEIVED_USER_LOCATION,
      reverseGeocodeSuccess: reverseGeocodeSuccess,
      lat: lat,
      lng: lng,
      address: address,
      bounds: bounds
    });
  });
}


function getGeoLocation () {
  return function (dispatch) {
    dispatch(requestUserLocation());

    // TODO if the browser doesn't support geolocation, make a note of it
    if (!navigator.geolocation) {
      //return dispatch({
      //  type: E.RECEIVED_USER_LOCATION,
      //  coords: {
      //    isFetching: true,
      //    latitude: null,
      //    longitude: null
      //  }
      //});
    }

    return dispatch(requestGeoLocation());
  }
}

function togglePanelVisibility (panel) {
  console.log("panel: ", panel);
  return {
    type: E.TOGGLE_PANEL_VISIBILITY,
    panel: panel
  };
}




export {
  setLocale,
  setSearchLocation,
  search,
  searchAutoComplete,
  setIntroOverlayVisibility,
  getGeoLocation,
  togglePanelVisibility
};
