import React from 'react';
import ReactDOM from 'react-dom';
import { addLocaleData, IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import Header from '../components/header/header';
import MainPanel from '../components/main-panel/main-panel';
import { store } from './core';

// locale information
import en from 'react-intl/dist/locale-data/en';
import es from 'react-intl/dist/locale-data/es';
import fr from 'react-intl/dist/locale-data/fr';
addLocaleData(en);
addLocaleData(es);
addLocaleData(fr);

const whatever = {
  something: "something1"
};


let header = document.getElementsByTagName('header')[0];
ReactDOM.render(
  <IntlProvider locale="en" messages={whatever}>
    <Provider store={store}>
      <Header />
    </Provider>
  </IntlProvider>,
  header
);

ReactDOM.render(<MainPanel />, document.getElementById('mainPanel'));


