function selectedTab (state = 'map', action) {
  switch (action.type) {
    case C.SELECT_TAB:
      return action.tab;
      break;
  }
}


export default selectedTab;
