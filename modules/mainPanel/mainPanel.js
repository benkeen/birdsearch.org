define([
	"mediator",
	"constants",
	"underscore",
	"moduleHelper",
	"text!mainPanelTemplate",
	"text!notableSightingsTableTemplate",
	"map"
], function(mediator, C, _, helper, mainTemplate, notableSightingsTableTemplate, map) {

	var _MODULE_ID = "mainPanel";
	var _currTabID = "mapTab";
	var _lastNotableSearch = null;

	var _init = function() {
		var subscriptions = {};
		subscriptions[C.EVENT.WINDOW_RESIZE] = _resizeMainPanel;
		subscriptions[C.EVENT.INIT_SEARCH] = _onInitSearch;
		subscriptions[C.EVENT.SELECT_TAB] = _onRequestTabChange;
		subscriptions[C.EVENT.SEARCH_TYPE_CHANGED] = _onSearchTypeChanged;
		subscriptions[C.EVENT.MAP.VIEW_NOTABLE_SIGHTING_SINGLE_LOCATION] = _showNotableSightingsSingleLocationTable;
		subscriptions[C.EVENT.MAP.NOTABLE_MARKERS_ADDED] = _onNotableMarkersAdded;
		subscriptions[C.EVENT.MAP.HOTSPOT_MARKERS_ADDED] = _onHotspotMarkersAdded;
		subscriptions[C.EVENT.LOCATION_CLICK] = _onLocationClick;
		mediator.subscribe(_MODULE_ID, subscriptions);

		// insert the main panel
		var tmpl = _.template(mainTemplate, {
			L: helper.L
		});

		$("#mainPanel").html(tmpl);
		_addMainPanelEvents();

		// insert the map
		map.create();
	};

	/**
	 * Any time there's a search, return it to the map tab. This is needed for technical reasons, but also it makes
	 * sense from a UI perspective.
	 * @private
	 */
	var _onInitSearch = function(msg) {
		_selectTab("mapTab");
		mediator.publish(_MODULE_ID, C.EVENT.SEARCH, msg.data);
	};

	var _addMainPanelEvents = function() {
		$("#panelTabs").on("click", "li", _onClickSelectTab);
		$("#birdSpeciesTabContent").on("click", ".filterNotableSightingByLocation", function(e) {
			e.preventDefault();
			var locationID = $(e.target).data("locationId");
			_addNotableSightingsSingleLocationTable(locationID);
		});
		$("#birdSpeciesTabContent").on("click", ".showNotableSightingsTable", function(e) {
			e.preventDefault();
			_addNotableSightingsTable();
		});
	};

	var _onClickSelectTab = function(e) {
		var tab = e.target;
		if ($(tab).hasClass("disabledTab")) {
			return;
		}
		var tabID = $(tab).attr("id");
		_selectTab(tabID);
	};

	/**
	 * Allows other components to call the tab changing functionality from their own code, rather than have
	 * to do all the work manually.
	 * @param msg
	 * @private
	 */
	var _onRequestTabChange = function(msg) {
		_selectTab(msg.data.tabID);
	};

	var _selectTab = function(tabID) {
		if (tabID === _currTabID) {
			return;
		}
		$("#panelTabs li").removeClass("btn-primary");
		$("#" + tabID).addClass("btn-primary");
		$("#" + _currTabID + "Content").addClass("hidden");
		$("#" + tabID + "Content").removeClass("hidden");

		_currTabID = tabID;
		mediator.publish(_MODULE_ID, C.EVENT.TAB_CHANGED, { tab: _currTabID });
	};

	var _resizeMainPanel = function(msg) {
		if (msg.data.viewportMode === "desktop") {
			$("#locationsTab").addClass("hidden");
			$("#mainPanel").css({
				height: msg.data.height - 54,
				width: msg.data.width - 318
			});
		} else {
			$("#locationsTab").removeClass("hidden");
			var panelHeight = msg.data.height - 210;
			$("#mainPanel").css({ height: panelHeight + "px", width: "100%" });
		}
	};

	var _addNotableSightingsTable = function() {

		// flatten the sightings info into a single array
		var sightings = [];
		for (var i=0; i<_lastNotableSearch.locations.length; i++) {
			var currLocation = _lastNotableSearch.locations[i];

			for (var j=0; j<currLocation.sightings.length; j++) {
				var currSighting = currLocation.sightings[j];
				currSighting.locationName = currLocation.n;
				currSighting.locationID = currLocation.locationID;
				sightings.push(currSighting);
			}
		}

		var html = _.template(notableSightingsTableTemplate, {
			isSingleLocation: false,
			searchObservationRecency: _lastNotableSearch.lastSearchObservationRecency,
			sightings: sightings,
			L: helper.L
		});

		// update the tab
		$("#birdSpeciesTab").html("Bird Sightings (" + sightings.length + ")");
		$("#birdSpeciesTabContent").html(html);
	};

	/**
	 * Shows notable sightings from a single location.
	 * @param msg
	 * @private
	 */
	var _showNotableSightingsSingleLocationTable = function(msg) {
		var locationID = msg.data.locationID;
		_addNotableSightingsSingleLocationTable(locationID);
	};

	var _addNotableSightingsSingleLocationTable = function(locationID) {
		var searchObservationRecency = _lastNotableSearch.lastSearchObservationRecency;

		var sightings = [];
		var locationName = null;
		var lat = null;
		var lng = null;
		for (var i=0; i<_lastNotableSearch.locations.length; i++) {
			if (_lastNotableSearch.locations[i].locationID !== locationID) {
				continue;
			}
			locationName = _lastNotableSearch.locations[i].n;
			lat = _lastNotableSearch.locations[i].lat;
			lng = _lastNotableSearch.locations[i].lng;
			sightings = _lastNotableSearch.locations[i].sightings;
			break;
		}

		var html = _.template(notableSightingsTableTemplate, {
			isSingleLocation: true,
			locationName: locationName,
			lat: lat,
			lng: lng,
			searchObservationRecency: searchObservationRecency,
			sightings: sightings,
			L: helper.L
		});

		// update the tab
		$("#birdSpeciesTabContent").html(html);

		// request the main panel change the tab
		_selectTab("birdSpeciesTab");
	};

	var _onNotableMarkersAdded = function(msg) {
		_lastNotableSearch = msg.data;

		var numLocations = msg.data.locations;
		if (numLocations) {
			$("#birdSpeciesTab").addClass("btn").removeClass("disabledTab");

			// now generate the table and automatically insert it into the page - even though it's not shown right now
			_addNotableSightingsTable();
		} else {
			$("#birdSpeciesTab").addClass("disabledTab").removeClass("btn");
		}
	};

	var _onLocationClick = function(msg) {
		if (_currTabID !== "birdSpeciesTab") {
			return;
		}
		var locationID = msg.data.locationID;
		_addNotableSightingsSingleLocationTable(locationID);
	};

	/**
	 * This is called whenever a user changes the search type.
	 * @param msg
	 * @private
	 */
	var _onSearchTypeChanged = function(msg) {
		var searchType = msg.data.newSearchType;
	};

	// ----------------------- HOTSPOTS -------------------------

	var _onHotspotMarkersAdded = function(msg) {
		$("#birdSpeciesTab").html("Bird Species").removeClass("btn").addClass("disabledTab");
	};

	mediator.register(_MODULE_ID, {
		init: _init
	});
});
