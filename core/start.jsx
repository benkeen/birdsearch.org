import React from 'react';
import ReactDOM from 'react-dom';
import Header from '../components/header/header';
import MainPanel from '../components/main-panel/main-panel';

ReactDOM.render(<Header />, document.getElementsByTagName('header')[0]);
ReactDOM.render(<MainPanel />, document.getElementById('mainPanel'));
