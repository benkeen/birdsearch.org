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

// this actually does the work of querying for the geolocation
function requestGeoLocation () {
  return function (dispatch) {
    navigator.geolocation.getCurrentPosition(function (position) {
      dispatch({
        type: E.RECEIVED_USER_LOCATION,
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    });
  };
}

function getGeoLocation() {
  return function (dispatch) {
    dispatch(requestUserLocation());

    // if the browser doesn't support geolocation, make a note of it
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

export {
  setIntroOverlayVisibility,
  getGeoLocation
};
