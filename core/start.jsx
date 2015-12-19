import React from 'react';
import ReactDOM from 'react-dom';
import { addLocaleData, IntlProvider } from 'react-intl';
import { Router, Route, Link } from 'react-router'
import { Provider, connect } from 'react-redux';
import Header from '../components/header/header';
import MainPanel from '../components/main-panel/main-panel';
import initStore from './utils';
import * as i18n from './i18n/index';
import * as storage from './storage';

// locale information for react-intl
import en from 'react-intl/dist/locale-data/en';
import es from 'react-intl/dist/locale-data/es';
import fr from 'react-intl/dist/locale-data/fr';
addLocaleData(en);
addLocaleData(es);
addLocaleData(fr);

// initialize the store with the appropriate lang (defaulting to English)
const store = initStore({ locale: storage.get('locale') || 'en' });

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

// MOVE
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
