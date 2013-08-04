require([
	"mediator",
	"page"
], function(mediator) {
	"use strict";

	// load all page components, then start up the app
	var pageComponents = [
		"dataCache", "header", "footer", "sidebar", "mainPanel", "about", "contact"
	];
	require(pageComponents, function() {
		mediator.start();
	});
});
