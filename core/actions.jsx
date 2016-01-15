import React from 'react';
import ReactDOM from 'react-dom';
import { C, E, helpers, _ } from './core';
//import fetch from 'isomorphic-fetch';


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

function startSearchRequest (searchSettings, locationInfo) {
  return {
    type: E.SEARCH_REQUEST_STARTED,
    lat: locationInfo.lat,
    lng: locationInfo.lng,
    location: locationInfo.location,
    bounds: locationInfo.bounds
  };
}

function searchRequestComplete () {
  return { type: E.SEARCH_REQUEST_ENDED };
}

function search (searchSettings, locationInfo) {
  return function (dispatch) {
    dispatch(startSearchRequest(searchSettings, locationInfo));

    var searchParams = {
      lat: locationInfo.lat,
      lng: locationInfo.lng,
      limitByObservationRecency: searchSettings.limitByObservationRecency,
      observationRecency: searchSettings.observationRecency
    };

    // holy good lord. This monstrosity makes a request for the hotspots, converts the results to JSON (which is async
    // for some reason...?) then publishes the appropriate action
    return fetchBirdSightings(searchParams)
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

function fetchBirdSightings (searchParams) {
  var formData = new FormData();
  _.each(searchParams, function (val, key) {
    formData.append(key, val);
  });

  return fetch('/birdsearch.org/ajax/getHotspotLocations.php', {
    method: 'POST',
    body: formData
  });
}

function setIntroOverlayVisibility (visible) {
  return {
    type: E.SET_INTRO_OVERLAY_VISIBILITY,
    visible
  };
}

function requestingUserLocation () {
  return { type: E.REQUESTING_USER_LOCATION };
}

function requestGeoLocation (searchInfo) {
  return function (dispatch) {
    navigator.geolocation.getCurrentPosition(function (position) {
      convertLatLngToAddress(dispatch, searchInfo, position.coords.latitude, position.coords.longitude);
    });
  };
}

function convertLatLngToAddress (dispatch, searchInfo, lat, lng) {
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

    dispatch({
      type: E.RECEIVED_USER_LOCATION,
      reverseGeocodeSuccess: reverseGeocodeSuccess,
      lat: lat,
      lng: lng,
      address: address,
      bounds: bounds
    });

    // Urgh! at this point I want to fire off an actual search request. But in order to do that, I need all the search
    // settings info. So we either:
    // - pass that info down the chain of method calls to here, or
    // - somehow listen to the RECEIVED_USER_LOCATION event (in a reducer, I guess), change something in the store which
    // a component would listen to, then in its componentDidUpdate() method call the search? Jesus. This is awful.


//lat: 49.376765299999995
//lng: -123.37015410000001
//location: "Bowen Island, BC, Canada"
//observationRecency: 30
//searchType: "all"


  });
}


function getGeoLocation (searchInfo) {
  return function (dispatch) {
    dispatch(requestingUserLocation());

    // TODO if the browser doesn't support geolocation, make a note of it
    //if (!navigator.geolocation) {
    //}

    return dispatch(requestGeoLocation(searchInfo));
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
  setIntroOverlayVisibility,
  getGeoLocation,
  togglePanelVisibility
};
