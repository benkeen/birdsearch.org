define([
	"mediator",
	"constants",
	"underscore",
	"moduleHelper",
	"text!mainPanelTemplate",
	"text!birdSightingsTableTemplate",
	"text!singleBirdSightingsTableTemplate",
	"text!notableSightingsTableTemplate",
	"map"
], function(mediator, C, _, helper, mainTemplate, birdSightingsTableTemplate, singleBirdSightingsTableTemplate,
			notableSightingsTableTemplate, map) {

	var _MODULE_ID = "mainPanel";
	var _currTabID = "mapTab";
	var _lastNotableSearch = null;
	var _lastSearchInfo;
	var _birdData;
	var _birdSearchObsRecency;
	var _L = {};


	var _init = function() {
		var subscriptions = {};
		subscriptions[C.EVENT.WINDOW_RESIZE] = _resizeMainPanel;
		subscriptions[C.EVENT.INIT_SEARCH] = _onInitSearch;
		subscriptions[C.EVENT.SELECT_TAB] = _onRequestTabChange;
		subscriptions[C.EVENT.MAP.VIEW_NOTABLE_SIGHTING_SINGLE_LOCATION] = _showNotableSightingsSingleLocationTable;
		subscriptions[C.EVENT.MAP.VIEW_SIGHTINGS_SINGLE_LOCATION] = _showBirdSightingsSingleLocationTable;
		subscriptions[C.EVENT.MAP.NOTABLE_MARKERS_ADDED] = _onNotableMarkersAdded;
		subscriptions[C.EVENT.MAP.HOTSPOT_MARKERS_ADDED] = _onHotspotMarkersAdded;
		subscriptions[C.EVENT.LOCATION_CLICK] = _onLocationClick;
		subscriptions[C.EVENT.BIRD_SIGHTINGS_LOADED] = _onBirdSightingsLoaded;
		mediator.subscribe(_MODULE_ID, subscriptions);

		require([helper.getCurrentLangFile()], function(L) {
			_L = L;

			// insert the main panel
			var eBirdText = L.site_not_affiliated_with_ebird.replace(/%1/, '<a href="http://ebird.org" target="_blank">eBird.org</a>');
			var tmpl = _.template(mainTemplate, {
				L: _L,
				eBirdText: eBirdText,
				githubUrl: C.CORE.GITHUB_URL,
				appVersion: C.CORE.APP_VERSION
			});

			$("#mainPanel").html(tmpl);
			_addMainPanelEvents();

			// insert the map
			map.create();
		});
	};


	/**
	 * Any time there's a search, return it to the map tab. This is needed for technical reasons, but also it makes
	 * sense from a UI perspective.
	 * @private
	 */
	var _onInitSearch = function(msg) {
		_selectTab("mapTab");
		_lastSearchInfo = msg.data;
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
		$("#birdSpeciesTabContent").on('click', ".toggleBirdSpeciesLocations", _onClickToggleBirdSpeciesLocations);
		$("#birdSpeciesTabContent").on("click", ".showBirdSightingsTable", function(e) {
			e.preventDefault();
			_addBirdSightingsTable();
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
			L: _L
		});

		// update the tab
		$("#birdSpeciesTab").html(_L.bird_sightings + " (" + sightings.length + ")");
		$("#birdSpeciesTabContent").html(html);
		_sortTable("#notableSightings");
	};


	var _addBirdSightingsTable = function() {
		var dataBySpecies = {};
		var numSpecies = 0;
		for (var locationID in _birdData) {

			// if this location's observations failed to load (for whatever reason), just ignore the row
			if (!_birdData[locationID].sightings.success) {
				continue;
			}

			var currLocationSpeciesInfo = _getLocationSpeciesList(locationID, _birdSearchObsRecency);
			for (var speciesSciName in currLocationSpeciesInfo.species) {
				var currData = currLocationSpeciesInfo.species[speciesSciName];

				if (!dataBySpecies.hasOwnProperty(speciesSciName)) {
					dataBySpecies[speciesSciName] = {
						comName: currData.comName,
						sciName: speciesSciName,
						obs: [],
						locations: [],
						mostRecentObservationTime: null,
						howManyCount: 0
					};
					numSpecies++;
				}
				dataBySpecies[speciesSciName].obs.push({
					howMany: currData.howMany,
					lat: currData.lat,
					lng: currData.lng,
					locID: currData.locID,
					locName: currData.locName,
					obsDt: currData.obsDt,
					obsReviewed: currData.obsReviewed,
					obsValid: currData.obsValid
				});

				dataBySpecies[speciesSciName].locations.push(currData.locName);
			}
		}

		// now convert the sightings into an array
		var sightings = [];
		for (var sciName in dataBySpecies) {
			sightings.push(dataBySpecies[sciName]);
		}
		sightings.sort(function(a, b) { return (a.comName.toLowerCase() > b.comName.toLowerCase()) ? 1 : -1; });

		var updatedSightings = [];
		for (var i=0; i<sightings.length; i++) {
			var lastObservation = 0;
			var howManyArray = [];
			var lastSeenArray = [];
			for (var j=0; j<sightings[i].obs.length; j++) {
				var observationTimeUnix = parseInt(moment(sightings[i].obs[j].obsDt, 'YYYY-MM-DD HH:mm').format("X"), 10);
				if (observationTimeUnix > lastObservation) {
					lastObservation = observationTimeUnix;
					sightings[i].mostRecentObservationTime = moment(sightings[i].obs[j].obsDt, 'YYYY-MM-DD HH:mm').format('MMM Do, H:mm a');
				}
				lastSeenArray.push(moment(sightings[i].obs[j].obsDt, 'YYYY-MM-DD HH:mm').format('MMM Do, H:mm a'));

				howMany = sightings[i].obs[j].howMany || "-";
				if (howMany.toString().match(/\D/g)) {
					howManyCount = "-";
					howManyArray.push("-");
				} else {
					howManyArray.push(sightings[i].obs[j].howMany);
					sightings[i].howManyCount += parseInt(sightings[i].obs[j].howMany, 10);
				}
			}

			sightings[i].howManyArray = howManyArray;
			sightings[i].lastSeenArray = lastSeenArray;
			updatedSightings.push(sightings[i]);
		}

		var html = _.template(birdSightingsTableTemplate, {
			isSingleLocation: false,
			searchObservationRecency: _birdSearchObsRecency,
			sightings: updatedSightings,
			L: _L
		});

		// update the tab
		$("#birdSpeciesTabContent").html(html);
		_sortTable("#birdSightings");
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

	/**
	 * Shows bird sightings from a single location.
	 * @param msg
	 * @private
	 */
	var _showBirdSightingsSingleLocationTable = function(msg) {
		var locationID = msg.data.locationID;
		_addBirdSightingsSingleLocationTable(locationID);
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
			L: _L
		});

		// update the tab
		$("#birdSpeciesTabContent").html(html);
		_sortTable("#notableSightings");

		// request the main panel change the tab
		_selectTab("birdSpeciesTab");
	};

	var _addBirdSightingsSingleLocationTable = function(locationID) {
		var searchObservationRecency = _lastSearchInfo.searchOptions.allAndNotable.observationRecency;

		// contains 30 days of sightings
		var results =_getLocationSpeciesList(locationID, searchObservationRecency);

		// now convert the sightings into an array
		var sightings = [];
		for (var sciName in results.species) {
			var observationDate = moment(results.species[sciName].obsDt, 'YYYY-MM-DD HH:mm').format('MMM Do, H:mm a');
			results.species[sciName].obsDateFormatted = observationDate;
			sightings.push(results.species[sciName]);
		}

		sightings.sort(function(a, b) { return (a.comName.toLowerCase() > b.comName.toLowerCase()) ? 1 : -1; });

		var html = _.template(singleBirdSightingsTableTemplate, {
			isSingleLocation: true,
			locationName: _birdData[locationID].n,
			lat: _birdData[locationID].lat,
			lng: _birdData[locationID].lng,
			searchObservationRecency: searchObservationRecency,
			sightings: sightings,
			L: _L
		});

		// update the tab
		$("#birdSpeciesTabContent").html(html);

		// request the main panel change the tab
		_selectTab("birdSpeciesTab");
		_sortTable("#birdSightings");
	};


	var _onNotableMarkersAdded = function(msg) {
		_lastNotableSearch = msg.data;

		var numLocations = msg.data.locations.length;
		if (numLocations > 0) {
			$("#birdSpeciesTab").addClass("btn").removeClass("hidden");

			// now generate the table and automatically insert it into the page - even though it's not shown right now
			_addNotableSightingsTable();
		} else {
			$("#birdSpeciesTab").addClass("hidden").removeClass("btn");
		}
	};


	var _onHotspotMarkersAdded = function(msg) {
		_lastBirdSearch = msg.data;
		$("#birdSpeciesTab").html(_L.bird_species).removeClass("btn").addClass("hidden disabledTab");
	};


	var _onLocationClick = function(msg) {
		if (_currTabID !== "birdSpeciesTab") {
			return;
		}

		var locationID = msg.data.locationID;
		if (_lastSearchInfo.resultType === "all") {
			_addBirdSightingsSingleLocationTable(locationID);
		} else if (_lastSearchInfo.resultType === "notable") {
			_addNotableSightingsSingleLocationTable(locationID);
		}
	};


	var _getLocationSpeciesList = function(locationID, obsRecency) {
		if (!_birdData.hasOwnProperty(locationID)) {
			return false;
		}

		var species = {};
		var numSpecies = 0;
		for (var i=0; i<obsRecency; i++) {
			var observations = _birdData[locationID].sightings.data[i].obs;
			for (var j=0; j<observations.length; j++) {
				if (!species.hasOwnProperty(observations[j].sciName)) {
					species[observations[j].sciName] = observations[j];
					numSpecies++;
				}
			}
		}

		return {
			numSpecies: numSpecies,
			species: species
		};
	};

	var _onBirdSightingsLoaded = function(msg) {
		_birdData = $.extend(true, {}, msg.data.birdData);
		_birdSearchObsRecency = msg.data.observationRecency;

		var numSpecies = _getUniqueSpeciesCount();
		if (numSpecies > 0) {
			$("#birdSpeciesTab").html(_L.bird_species + " (" + numSpecies + ")").removeClass("hidden disabledTab").addClass("btn");
			_addBirdSightingsTable();
		}
	};


	/**
	 * @param observationRecency
	 * @private
	 */
	var _getUniqueSpeciesCount = function() {
		var uniqueSpeciesInAllLocations = {};
		var numUniqueSpeciesInAllLocations = 0;

		for (var locationID in _birdData) {
			var sightingsData = _birdData[locationID].sightings.data;
			for (var j=0; j<=_birdSearchObsRecency-1; j++) {
				var currDaySightings = sightingsData[j].obs;
				for (var k=0; k<currDaySightings.length; k++) {
					if (!uniqueSpeciesInAllLocations.hasOwnProperty(currDaySightings[k].sciName)) {
						uniqueSpeciesInAllLocations[currDaySightings[k].sciName] = null;
						numUniqueSpeciesInAllLocations++;
					}
				}
			}
		}
		return numUniqueSpeciesInAllLocations;
	};


	/**
	 * Called whenever the user clicks the (+) or (-) in the Bird Species tab to expand/contract the list of Locations Seen
	 * for either a single bird, or all birds in the tab.
	 */
	var _onClickToggleBirdSpeciesLocations = function(e) {
		e.preventDefault();

		// find out if this is the header or just a table row
		if ($(e.target).html() === '(+)') {
			$(e.target).html("(-)");
			$(".birdLocations").removeClass("hidden");
			$(".lastSeenSingle,.howManySingle").css("visibility", "hidden");
			$(".lastSeenDetails,.howManyDetails").removeClass("hidden");
		} else {
			$(e.target).html("(+)");
			$(".birdLocations").addClass("hidden");
			$(".lastSeenSingle,.howManySingle").css("visibility", "visible");
			$(".lastSeenDetails,.howManyDetails").addClass("hidden");
		}
	};


	var _sortTable = function(el) {
		try {
			$(el).trigger("destroy");
		} catch (e) { }
		$(el).tablesorter();
	};

	mediator.register(_MODULE_ID, {
		init: _init
	});
});
