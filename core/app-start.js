require([
	"manager",
	"page",
	"simplemodal"
], function(manager) {
	"use strict";

	// load all page components, then start up the app
	var pageComponents = ["header", "footer", "sidebar", "mainPanel", "about", "contact"];
	require(pageComponents, function() {
		manager.start();
	});
});
