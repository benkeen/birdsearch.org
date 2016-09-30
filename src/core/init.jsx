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
const mapType = storage.get('mapType') || C.DEFAULT_MAP_TYPE;
const searchType = storage.get('searchType') || C.SEARCH_SETTINGS.DEFAULT_SEARCH_TYPE;
const zoomHandling = storage.get('zoomHandling') || C.SEARCH_SETTINGS.DEFAULT_ZOOM_HANDLING;
const store = initStore({ storedSettings: { locale: locale, mapType: mapType }});

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
const ConnectedI18nWrapper = connect(state => ({ locale: state.storedSettings.locale }))(I18NWrapper);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedI18nWrapper />
  </Provider>,
  document.getElementById('app')
);