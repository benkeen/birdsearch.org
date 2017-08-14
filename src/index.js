import React from 'react';
import ReactDOM from 'react-dom';
import thunk from 'redux-thunk';
import { addLocaleData, IntlProvider } from 'react-intl';
import { Router, Route, browserHistory } from 'react-router';
import { Provider, connect } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import * as reducers from './core/reducers';
import { C, storage, i18n } from './core/core';
import registerServiceWorker from './registerServiceWorker';

// locale information for react-intl
import en from 'react-intl/locale-data/en'
import es from 'react-intl/locale-data/es';
import fr from 'react-intl/locale-data/fr';
import de from 'react-intl/locale-data/de';

// application components
import App from './components/app';
import Intro from './components/modals/intro';
import About from './components/modals/about';
import Report from './components/modals/report';
import Settings from './components/modals/settings';
import SearchTip from './components/general/search-tip';

addLocaleData(en);
addLocaleData(es);
addLocaleData(fr);
addLocaleData(de);

// initialize the section of the store based on local storage values
const locale = storage.get('locale') || C.DEFAULT_LOCALE;
const mapStyle = storage.get('mapStyle') || C.MAP_STYLES.DEFAULT;
const mapTypeId = storage.get('mapTypeId') || google.maps.MapTypeId.ROADMAP;
const searchType = storage.get('searchType') || C.SEARCH_SETTINGS.DEFAULT_SEARCH_TYPE;
const obsRecency = storage.get('obsRecency') || C.SEARCH_SETTINGS.DEFAULT_SEARCH_DAYS;
const zoomHandling = storage.get('zoomHandling') || C.SEARCH_SETTINGS.DEFAULT_ZOOM_HANDLING;

const sciName = storage.get('showScientificName');
const showScientificName = (sciName && sciName === '1');

// bah, this sucks. You can't init a store with redux by passing in only specific nested values to be overridden
// (i.e. our settings just pulled from local storage). Redux strongly urges you to keep a flat object of all settings,
// but I found it much clearer to group the state info in the store (in my case user, searchSettings, etc). The
// problem with THAT is now we need to pass in ALL values for each overridden values, causing the duplication below.
// I also tried pulling all these stored values into their own section the store, but the data felt like it was badly
// organized.
const store = initStore({
  user: {
    locale: locale,
    isFetching: false,
    userLocationFound: false,
    lat: null,
    lng: null,
    address: ''
  },
  mapSettings: {
    zoom: 3,
    mapTypeId: mapTypeId,
    lat: 30,
    lng: 0,
    bounds: null,
    searchUpdateCounter: 0,
    resetSearchCounter: 0
  },
  searchSettings: {
    searchType: searchType,
    location: '',
    lat: null,
    lng: null,
    observationRecency: obsRecency,
    zoomHandling: zoomHandling
  },
  settingsOverlay: {
    selectedTab: C.SEARCH_OVERLAY_TABS.SEARCH_SETTINGS,
    visible: false,
    searchType: searchType,
    observationRecency: obsRecency,
    zoomHandling: zoomHandling,
    showScientificName: showScientificName,
    mapStyle: mapStyle
  }
});

// meh. Gotta go somewhere.
$('body').addClass(locale);


const I18NWrapper = ({ locale }) => (
  <IntlProvider key="intl" locale={locale} messages={i18n[locale]}>
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <Route path="/about" component={About} />
        <Route path="/intro" component={Intro} />
        <Route path="/search" component={SearchTip} />
        <Route path="/settings" component={Settings} />
        <Route path="/report" component={Report} />
      </Route>
    </Router>
  </IntlProvider>
);

function initStore (initialState) {
  const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
  return createStoreWithMiddleware(combineReducers(reducers), initialState);
}
const ConnectedI18nWrapper = connect(state => ({ locale: state.user.locale }))(I18NWrapper);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedI18nWrapper />
  </Provider>,
  document.getElementById('app')
);

registerServiceWorker();
