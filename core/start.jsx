import React from 'react';
import ReactDOM from 'react-dom';
import { addLocaleData, IntlProvider } from 'react-intl';
import { Provider, connect } from 'react-redux';
import Header from '../components/header/header';
import MainPanel from '../components/main-panel/main-panel';
import initStore from './utils';
import * as i18n from './i18n/index';

// locale information for react-intl
import en from 'react-intl/dist/locale-data/en';
import es from 'react-intl/dist/locale-data/es';
import fr from 'react-intl/dist/locale-data/fr';
addLocaleData(en);
addLocaleData(es);
addLocaleData(fr);


const initialState = {
  locale: 'en' // storage.get('locale') || 'en'
};
const store = initStore(initialState);


function getRootChildren (props) {
  const intlData = {
    locale: props.locale,
    messages: i18n[props.locale]
  };

  const children = [
    <IntlProvider key="intl" {...intlData}>
      <Header />
    </IntlProvider>
  ];

  return children;
}


class Root extends React.Component {
  render () {
    return (
      <div>{getRootChildren(this.props)}</div>
    );
  }
}

let header = document.getElementsByTagName('header')[0];

ReactDOM.render(
  <Provider store={store}>
    <Root locale={store.getState().locale} />
  </Provider>,
  header
);
