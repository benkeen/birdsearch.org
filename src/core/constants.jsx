const C = {
	DEBUG: false,
	DEFAULT_LOCALE: 'en',
	DEFAULT_MAP_TYPE: '', // TODO
	TRANSITION_SPEED: 150,
	ERROR_VISIBILITY_TIME: 3000,

	PANELS: {
		OVERVIEW: 'overview',
		LOCATIONS: 'locations',
		SPECIES: 'species'
	},

	SEARCH_SETTINGS: {
		DEFAULT_SEARCH_DAYS: "7",
		DEFAULT_SEARCH_TYPE: 'SEARCH_TYPE_ALL',
		DEFAULT_ZOOM_HANDLING: 'ZOOM_HANDLING_AUTO_ZOOM',
		NUM_SEARCH_DAYS: 30,
		SEARCH_TYPES: {
			ALL: 'SEARCH_TYPE_ALL',
			NOTABLE: 'SEARCH_TYPE_NOTABLE'
		},
		ZOOM_HANDLING: {
			AUTO_ZOOM: 'ZOOM_HANDLING_AUTO_ZOOM',
			FULL_SEARCH: 'ZOOM_HANDLING_FULL_SEARCH'
		}
	},

	PANEL_DIMENSIONS: {
		PADDING: 0,
		TOP: 60,
		OVERVIEW_PANEL_HEIGHT: 106,
		LEFT_PANEL_WIDTH: 300,
		PANEL_FOOTER_HEIGHT: 24
	},

	COLOUR_RANGES: {
		RANGE1: 10,
		RANGE2: 20,
		RANGE3: 30,
		RANGE4: 40,
		RANGE5: 50,
		RANGE6: 60,
		RANGE7: 70,
		RANGE8: 80
	},

	LOCATION_SORT: {
		FIELDS: {
			LOCATION: 'LOCATION_SORT_LOCATION',
			SPECIES: 'LOCATION_SORT_SPECIES'
		}
	},

	SIGHTINGS_SORT: {
		FIELDS: {
			SPECIES: 'SIGHTINGS_SORT_SPECIES',
			NUM_LOCATIONS: 'SIGHTINGS_SORT_NUM_LOCATIONS',
			LAST_SEEN: 'SIGHTINGS_SORT_LAST_SEEN',
			NUM_REPORTED: 'SIGHTINGS_SORT_NUM_REPORTED'
		}
	},

	NOTABLE_SIGHTINGS_SORT: {
		FIELDS: {
			LOCATION: 'NOTABLE_SORT_LOCATION',
			SPECIES: 'NOTABLE_SORT_SPECIES',
			DATE_SEEN: 'NOTABLE_SORT_DATE_SEEN',
			NUM_REPORTED: 'NOTABLE_SORT_NUM_REPORTED',
      REPORTER: 'NOTABLE_SORT_REPORTER',
      STATUS: 'NOTABLE_SORT_STATUS'
		}
	},

	SORT_DIR: {
		DEFAULT: 'SORT_DIR_DEFAULT',
		REVERSE: 'SORT_DIR_REVERSE'
	},

	MISC: {
		SEARCH_DAYS: [],
		MAX_SEARCH_DAYS: 30
	},

  ONE_OFFS: {
    MAIN_SEARCH_FIELD_FOCUS: 'MAIN_SEARCH_FIELD_FOCUS'
  },

	ABOUT_TABS: {
		ABOUT: 'ABOUT_TABS_ABOUT',
		HISTORY: 'ABOUT_TABS_HISTORY',
		TRANSLATE: 'ABOUT_TABS_TRANSLATE',
		CONTACT: 'ABOUT_TABS_CONTACT'
	},

	SEARCH_OVERLAY_TABS: {
		SEARCH_SETTINGS: 'SEARCH_SETTINGS_TAB_SEARCH_SETTINGS',
		MISC_TAB: 'SEARCH_SETTINGS_TAB_MISC'
	}

};

export { C };
