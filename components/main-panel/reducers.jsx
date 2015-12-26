import { C } from '../../core/constants';
import { E } from '../../core/events';
import * as storage from '../../core/storage';


function getIntroOverlayVisibility (state = true, action) {
  switch (action.type) {
    case E.SET_INTRO_OVERLAY_VISIBILITY:
      return action.visible;
    default:
      return state;
  }
}

export { getIntroOverlayVisibility };
