import { E } from '../../core/events';


function selectLang (state = C.DEFAULT_LANG, action) {
  switch (action.type) {
    case E.SELECT_LANG:
      return action.lang;
    default:
      return state;
  }
}


export { selectLang };
