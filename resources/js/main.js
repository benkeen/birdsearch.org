requirejs.config({
	baseUrl: 'resources/js/',
	paths: {
		'tablesorter': 'libs/jquery.tablesorter.min'
	},
    shim: {
		'tablesorter': 'jquery'
    }
});

require([
	'jquery',
	'manager'
], function($, manager) {
	'use strict';

	manager.init();
});
