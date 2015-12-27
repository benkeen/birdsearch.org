import { C } from '../../core/constants';
import { E } from '../../core/events';
import * as storage from '../../core/storage';


function introOverlayVisible (state = true, action) {
  switch (action.type) {
    case E.SET_INTRO_OVERLAY_VISIBILITY:
      return action.visible;
    default:
      return state;
  }
}

function isRequestingUserLocation (state = false, action) {
  switch (action.type) {
    case E.REQUEST_USER_LOCATION:
      return action.isRequestingUserLocation;
    default:
      return state;
  }
}

export {
  introOverlayVisible,
  isRequestingUserLocation
};
