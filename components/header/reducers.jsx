import { C } from '../../core/constants';
import { E } from '../../core/events';


function getLocale (state = C.DEFAULT_LANG, action) {
  switch (action.type) {
    case E.SELECT_LANG:
      return action.locale;
    default:
      return state;
  }
}


export { getLocale };
