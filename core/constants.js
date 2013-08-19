define([], function() {

	var _CONSTANTS = {};

	_CONSTANTS.DEBUG = false;

	_CONSTANTS.CORE = {
		APP_VERSION:  "1.1.0",
		RELEASE_DATE: "",
		GITHUB_URL:   "https://github.com/benkeen/birdsearch.org"
	};

	_CONSTANTS.EVENT = {
		ABOUT_LINK_CLICK: "aboutDialog-link-click",
		TAB_CHANGED: "tab-changed",
		SELECT_TAB: "select-tab",
		WINDOW_RESIZE: "window-resize",
		TRIGGER_WINDOW_RESIZE: "trigger-window-resize",
		SEARCH_TYPE_CHANGED: 'search-type-changed',
		SEARCH: "search",
		INIT_SEARCH: "init-search",
		BIRD_SIGHTINGS_LOADED: "bird-sightings-loaded",

		MAP: {
			BIRD_MARKERS_ADDED: 'map-bird-markers-added',
			NOTABLE_MARKERS_ADDED: 'map-notable-markers-added',
			HOTSPOT_MARKERS_ADDED: 'map-hotspot-markers-added',
			VIEW_NOTABLE_SIGHTING_SINGLE_LOCATION: 'view-notable-sighting-single-location'
		},

		LOCATION_MOUSEOVER: 'location-mouseover',
		LOCATION_MOUSEOUT: 'location-mouseout',
		LOCATION_CLICK: 'location-click'
	};

	_CONSTANTS.SETTINGS = {
		MAX_HOTSPOTS: 50,
		DEFAULT_SEARCH_DAY: 7,
		NUM_SEARCH_DAYS: 30
	};

	return _CONSTANTS;
});