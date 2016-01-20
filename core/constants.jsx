const C = {
	DEBUG: false,
	DEFAULT_LOCALE: 'en',
	TRANSITION_SPEED: 200,
	ONE_DAY_IN_SECONDS: 24 * 60 * 60,

	PANELS: {
		OVERVIEW: 'overview',
		LOCATIONS: 'locations',
		SPECIES: 'species'
	},
	CORE: {
		APP_VERSION: "2.0.0 - BETA",
		RELEASE_DATE: "Jan 17, 2015",
		GITHUB_URL: "https://github.com/benkeen/birdsearch.org"
	},
	SEARCH_SETTINGS: {
		DEFAULT_SEARCH_DAYS: 30,
		NUM_SEARCH_DAYS: 30
	},

	PANEL_DIMENSIONS: {
		PADDING: 10,
		TOP: 71,
		OVERVIEW_PANEL_HEIGHT: 106,
		LEFT_PANEL_WIDTH: 300
	}

};

export { C };
