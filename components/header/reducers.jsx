import { C } from '../../core/constants';
import { E } from '../../core/events';
import * as storage from '../../core/storage';


function getLocale (state = C.DEFAULT_LOCALE, action) {
  switch (action.type) {
    case E.SET_LOCALE:
      storage.set('locale', action.locale);
      return action.locale;
    default:
      return state;
  }
}


export { getLocale };
