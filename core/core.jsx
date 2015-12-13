/**
 * One file to rule them all. This is the core JS file, included by all other files. It exposes a bunch of helpful
 * stuff like the store, constants, events and the appropriate language file.
 */
import { createStore, combineReducers } from 'redux';
import CONSTANTS from 'constants';
import EVENTS from 'events';
import { getCurrentLangFile } from 'helpers';

import LANG from '../lang/en'; // TODO, obviously
//var LANG = getCurrentLangFile();

// this'll need to be fed a full list of reducers, stores all over the place
//import selectedTab from '../components/header/reducer';
//var reducers = combineReducers({
//  selectedTab
//});


// export
//export var store = createStore(reducers);

export { CONSTANTS };
export { LANG as L };


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
