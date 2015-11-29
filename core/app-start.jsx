import React from 'react';
import ReactDOM from 'react-dom';
import Header from '../components/header.jsx';

ReactDOM.render(<Header />, document.getElementsByTagName('header')[0]);



/*
require([
	"mediator",
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
