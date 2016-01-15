import React from 'react';
import ReactDOM from 'react-dom';
import { addLocaleData, IntlProvider } from 'react-intl';
import { Router, Route } from 'react-router';
import { Provider, connect } from 'react-redux';
import * as components from '../components/index';
import initStore from './utils';
import * as i18n from './i18n/index';
import * as storage from './storage';
import { C } from './core';

// locale information for react-intl
import en from 'react-intl/dist/locale-data/en';
import es from 'react-intl/dist/locale-data/es';
import fr from 'react-intl/dist/locale-data/fr';
import de from 'react-intl/dist/locale-data/de';
addLocaleData(en);
addLocaleData(es);
addLocaleData(fr);
addLocaleData(de);

const {
  Header,
  MainPanel
} = components;

// initialize the store with the appropriate lang
const store = initStore({ locale: storage.get('locale') || C.DEFAULT_LOCALE });

// debugging
//console.log("initial store state: ", store.getState());
//store.subscribe(() => console.log("store just changed: ", store.getState()));


class I18NWrapper extends React.Component {
  render () {
    const { locale } = this.props;

    return (
      <IntlProvider key="intl" locale={locale} messages={i18n[locale]}>
        <Router>
          <Route component={App}>
            <Route path="/" component={MainPanel} />
          </Route>
        </Router>
      </IntlProvider>
    );
  }
}

// our top level component. This is the wrapper for the whole site
const App = React.createClass({
  render () {
    return (
      <div id="page-wrapper">
        <Header />
        {this.props.children}
      </div>
    )
  }
});

var ConnectedI18nWrapper = connect(state => ({ locale: state.locale }))(I18NWrapper);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedI18nWrapper />
  </Provider>,
  document.getElementById('app')
);
