/**
 *
 */
import { createStore, combineReducers } from 'redux';
import { L } from '../lang/en';
import { C } from './constants';
import { E } from './events';

//import { getCurrentLangFile } from 'helpers';
//var LANG = getCurrentLangFile();

import { selectLang } from '../components/header/reducers';

var reducers = combineReducers({
  lang: selectLang
});


var store = createStore(reducers);

export { C, E, L, store };


/*
require([
 "page",
 "dataCache",
 "header",
 //"sidebar",
 "mainPanel"
 //"aboutDialog"
 ], function(mediator) {
 "use strict";

 $(function() {
 $.tablesorter.addParser({
 id: "customdate",
 is: function() { return false; },
 format: function(s, table, cell, cellIndex) {
 var u = $(cell).data("u");
 if (u) {
 return parseInt(u, 10);
 }
 },
 type: 'numeric'
 });

 $.tablesorter.addParser({
 id: 'species',
 is: function() { return false; },
 format: function(s, table, cell) {
 return $(cell).find("div").text();
 },
 type: 'numeric'
 });

 // start 'er up!
 mediator.start();
 });
 });
 */
