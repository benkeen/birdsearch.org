define([], function() {

	var _CONSTANTS = {};

	_CONSTANTS.DEBUG = false;

	_CONSTANTS.CORE = {
		APP_VERSION:  "1.1.0",
		RELEASE_DATE: "",
		GITHUB_URL:   "https://github.com/benkeen/eBirdsearch.org"
	};

	_CONSTANTS.EVENT = {
		ABOUT_LINK_CLICK: "about-link-click",
		CONTACT_LINK_CLICK: "contact-link-click",
		SELECT_TAB: "select-tab",
		WINDOW_RESIZE: "window-resize",
		TRIGGER_WINDOW_RESIZE: "trigger-window-resize",
		SEARCH: "search",

		MAP: {
			HOTSPOT_MARKERS_ADDED: 'map-hotspot-markers-added'
		},

		HOTSPOT_LOCATION_MOUSEOVER: 'hotspot-location-mouseover',
		HOTSPOT_LOCATION_MOUSEOUT: 'hotspot-location-mouseout',
		HOTSPOT_LOCATION_CLICK: 'hotspot-location-click'
	};

	_CONSTANTS.SETTINGS = {
		MAX_HOTSPOTS: 50,
		DEFAULT_SEARCH_DAY: 7
	};

	return _CONSTANTS;
});