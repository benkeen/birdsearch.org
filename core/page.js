/**
 * This module handles anything generic applying to the page as a whole: window resize events,
 * for example.
 */
define([
	"manager",
	"constants"
], function(manager, C) {

	var _MODULE_ID = "page";
	var _VIEWPORT_WIDTH_BREAKPOINT = 640; // where should this live?


	var _init = function() {
		$(window).resize(_handleWindowResize);

		var subscriptions = {};
		subscriptions[C.EVENT.TRIGGER_WINDOW_RESIZE] = _handleWindowResize;
		manager.subscribe(_MODULE_ID, subscriptions);
	};


	var _handleWindowResize = function() {
		var windowHeight = $(window).height();
		var windowWidth  = $(window).width();

		var viewportMode = 'desktop';
		if (windowWidth < _VIEWPORT_WIDTH_BREAKPOINT) {
			viewportMode = 'mobile';
		}

		manager.publish(_MODULE_ID, C.EVENT.WINDOW_RESIZE, {
			viewportMode: viewportMode,
			width: windowWidth,
			height: windowHeight
		});

		/*
		if (_pageViewportMode === 'desktop') {
			$('#fullPageSearchResults').css('height', windowHeight - 267);
		} else {
		}
		*/
	};


	manager.register(_MODULE_ID, {
		init: _init
	});
});