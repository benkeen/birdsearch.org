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

	var _init = function() {
		var subscriptions = {};
		subscriptions[C.EVENT.WINDOW_RESIZE] = _resizeMainPanel;
		subscriptions[C.EVENT.INIT_SEARCH] = _onInitSearch;
		subscriptions[C.EVENT.SEARCH_TYPE_CHANGED] = _onSearchTypeChange;
		subscriptions[C.EVENT.SELECT_TAB] = _onRequestTabChange;
		subscriptions[C.EVENT.MAP.VIEW_NOTABLE_SIGHTING_SINGLE_LOCATION] = _showNotableSightingsSingleLocationTable;
		subscriptions[C.EVENT.MAP.NOTABLE_MARKERS_ADDED] = _onNotableMarkersAdded;
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

		// now continue with the publish event
		mediator.publish(_MODULE_ID, C.EVENT.SEARCH, msg.data);
	};

	var _addMainPanelEvents = function() {
		$("#panelTabs").on("click", "li", _onClickSelectTab);
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

	var _onSearchTypeChange = function(msg) {

	};

	var _addNotableSightingsTable = function(msg) {

		// flatten the sightings info into a single array
		var sightings = [];
		for (var i=0; i<msg.data.locations.length; i++) {
			var currLocation = msg.data.locations[i];

			for (var j=0; j<currLocation.sightings.length; j++) {
				var currSighting = currLocation.sightings[j];
				currSighting.locationName = currLocation.n;
				currSighting.locationID = currLocation.locationID;
				sightings.push(currSighting);
			}
		}


		var html = _.template(notableSightingsTableTemplate, {
			isSingleLocation: false,
			searchObservationRecency: msg.data.lastSearchObservationRecency,
			sightings: sightings
		});

		// update the tab
		$("#birdSpeciesTab").html("Bird Species (" + sightings.length + ")");
		$("#birdSpeciesTabContent").html(html);
	};

	var _showNotableSightingsSingleLocationTable = function(msg) {
		var lastSearch = msg.data.lastSearchNotableSightings;
		var searchObservationRecency = msg.data.lastSearchObservationRecency;

		var sightings = [];
		var locationName = null;
		var lat = null;
		var lng = null;
		for (var i=0; i<lastSearch.length; i++) {
			if (lastSearch[i].locationID !== msg.data.locationID) {
				continue;
			}
			locationName = lastSearch[i].n;
			lat = lastSearch[i].lat;
			lng = lastSearch[i].lng;
			sightings = lastSearch[i].sightings;
			break;
		}

		var html = _.template(notableSightingsTableTemplate, {
			isSingleLocation: true,
			locationName: locationName,
			lat: lat,
			lng: lng,
			searchObservationRecency: searchObservationRecency,
			sightings: sightings
		});

		// update the tab
		$("#birdSpeciesTabContent").html(html);

		// request the main panel change the tab
		_selectTab("birdSpeciesTab");
	};


	var _onNotableMarkersAdded = function(msg) {
		var numLocations = msg.data.locations;
		if (numLocations) {
			$("#birdSpeciesTab").addClass("btn").removeClass("disabledTab");

			// now generate the table and automatically insert it into the page - even though it's not shown right now
			_addNotableSightingsTable(msg);
		} else {
			$("#birdSpeciesTab").addClass("disabledTab").removeClass("btn");
		}
	};

	mediator.register(_MODULE_ID, {
		init: _init
	});
});
