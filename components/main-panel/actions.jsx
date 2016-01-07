import React from 'react';
import ReactDOM from 'react-dom';
import { C, E } from '../../core/core';


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
    if (status === google.maps.GeocoderStatus.OK) {
      if (results[1]) {
        reverseGeocodeSuccess = true;
        address = results[1].formatted_address;
      }
    }

    dispatch({
      type: E.RECEIVED_USER_LOCATION,
      reverseGeocodeSuccess: reverseGeocodeSuccess,
      lat: lat,
      lng: lng,
      address: address
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
  return {
    type: E.TOGGLE_PANEL_VISIBILITY,
    panel: panel
  };
}

export {
  setIntroOverlayVisibility,
  getGeoLocation,
  togglePanelVisibility
};
