import { C } from '../../core/constants';
import { E } from '../../core/events';
import * as storage from '../../core/storage';


function userLocation (state = {
  isFetching: false,
  lat: null,
  lng: null
}, action) {
  switch (action.type) {
    case E.REQUEST_USER_LOCATION:
      return Object.assign({}, state, { isFetching: true });
    break;

    case E.RECEIVED_USER_LOCATION:
      return Object.assign({}, state, {
        isFetching: false,
        lat: action.lat,
        lng: action.lng
      });
    default:
      return state
  }
}

export {
  userLocation
};
