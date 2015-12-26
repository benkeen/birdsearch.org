import React from 'react';
import ReactDOM from 'react-dom';
import { C, E } from '../../core/core';


function setIntroOverlayVisiblity (visible) {
  return {
    type: E.SET_INTRO_OVERLAY_VISIBILITY,
    visible
  };
}

export {
  setIntroOverlayVisiblity
};
