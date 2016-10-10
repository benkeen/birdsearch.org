import React from 'react';
import ReactDOM from 'react-dom';
import thunk from 'redux-thunk';
import { addLocaleData, IntlProvider } from 'react-intl';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { Provider, connect } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import * as reducers from './reducers';
import { C, storage, i18n } from './core';

// locale information for react-intl
import en from 'react-intl/locale-data/en'
import es from 'react-intl/locale-data/es';
import fr from 'react-intl/locale-data/fr';
import de from 'react-intl/locale-data/de';
addLocaleData(en);
addLocaleData(es);
addLocaleData(fr);
addLocaleData(de);

// application components
import App from '../components/app';
import Intro from '../components/intro';
import About from '../components/about';
import Settings from '../components/settings';

// initialize the section of the store based on local storage values
const locale = storage.get('locale') || C.DEFAULT_LOCALE;
const mapTypeId = storage.get('mapTypeId') || google.maps.MapTypeId.ROADMAP;
const searchType = storage.get('searchType') || C.SEARCH_SETTINGS.DEFAULT_SEARCH_TYPE;
const zoomHandling = storage.get('zoomHandling') || C.SEARCH_SETTINGS.DEFAULT_ZOOM_HANDLING;

// bah, this sucks. You can't init a store with redux by passing in only specific nested values to be overridden
// (i.e. our settings just pulled from local storage). Redux strongly urges you to keep a flat object of all settings,
// but I found that led to confusion: it's much clearer to group the state info in the store (user, searchSettings,
// etc). The problem with THAT is now we need to pass in ALL values for each overridden values, basically causing
// duplications. I also tried pulling all these stored values into their own section the store, but the data felt
// like it was badly organized.
const store = initStore({
  user: {
    locale: locale
  },
  mapSettings: {
    zoom: 3,
    mapTypeId: mapTypeId,
    lat: 30,
    lng: 0,
    bounds: null,
    searchCounter: 0

  },
  searchSettings: {
    searchType: searchType,
    location: '',
    lat: null,
    lng: null,
    observationRecency: C.SEARCH_SETTINGS.DEFAULT_SEARCH_DAYS,
    zoomHandling: zoomHandling
  }
});


// meh. Gotta go somewhere.
$('body').addClass(locale);


class I18NWrapper extends React.Component {
  render () {
    const { locale } = this.props;

    return (
      <IntlProvider key="intl" locale={locale} messages={i18n[locale]}>
        <Router history={browserHistory}>
          <Route path="/" component={App}>
            <Route path="/about" component={About} />
            <Route path="/intro" component={Intro} />
            <Route path="/settings" component={Settings} />
          </Route>
        </Router>
      </IntlProvider>
    );
  }
}

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
