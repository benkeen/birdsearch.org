import React from 'react';
import ReactDOM from 'react-dom';
import { C, E } from '../../core/core';


function setIntroOverlayVisibility (visible) {
  return {
    type: E.SET_INTRO_OVERLAY_VISIBILITY,
    visible
  };
}

function getUserLocation () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (pos) { console.log(pos); });
  }

  return {
    type: E.REQUEST_USER_LOCATION,
    isRequestingUserLocation: true
  };
}

export {
  setIntroOverlayVisibility,
  getUserLocation
};
