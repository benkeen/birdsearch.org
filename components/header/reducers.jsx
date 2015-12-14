import C from '../../core/constants';
import E from '../../core/events';


function lang (state = C.DEFAULT_LANG, action) {
  switch (action.type) {
    case E.SELECT_LANG:
      return action.lang;
      break;
  }
}

export default { lang };
