import { C } from '../../core/constants';
import { E } from '../../core/events';


function sidebarVisible (state = false, action) {
  switch (action.type) {
    case E.SET_SIDEBAR_VISIBILITY:
      return action.visible;
    default:
      return state;
  }
}

export { sidebarVisible };
