define([
	"mediator",
	"constants",
	"moduleHelper",
	"text!sidebarTemplate",
	"text!sidebarResultsTable",
], function(mediator, C, helper, sidebarTemplate, sidebarResultsTableTemplate) {
	"use strict";

	var _MODULE_ID = "sidebar";
	var _autoComplete;
	var _geocoder;
	var _lastSearchNumAddressComponents;
	var _lastSearchObsRecency = null;
	var _currResultType = "all";
	var _searchOptionsEnabled = false;
	var _currentMouseoverLocationID = null;
	var _sidebarResultPanelOffsetHeight = null;
	var _sightingsArray = [];

	// DOM nodes
	var _locationField;
	var _resultTypeGroup;
	var _resultTypeField;
	var _searchOptionsLink;
	var _observationRecencySection;
	var _observationRecencyField;
	var _observationRecencyDisplay;
	var _hotspotActivitySection;
	var _hotspotActivityRecencyDisplay;
	var _limitHotspotsByObservationRecency;
	var _hotspotActivity;
	var _searchBtn;

	// misc globally things
	var _locationObj;
	var _viewportObj;
	var _birdSearchHotspots = {};
	var _visibleLocations = [];
	var _numVisibleLocations = null;
	var _L = {};

	var _CURRENT_SERVER_TIME = null;
	var _ONE_DAY_IN_SECONDS = 24 * 60 * 60;


	var _init = function() {
		_CURRENT_SERVER_TIME = parseInt($("body").data("serverdatetime"), 10);

		// keep track of when the window is resized
		var subscriptions = {};
		subscriptions[C.EVENT.WINDOW_RESIZE] = _onResize;
		subscriptions[C.EVENT.MAP.BIRD_MARKERS_ADDED] = _onBirdMarkersAdded;
		subscriptions[C.EVENT.MAP.NOTABLE_MARKERS_ADDED] = _onNotableMarkersAdded;
		subscriptions[C.EVENT.MAP.HOTSPOT_MARKERS_ADDED] = _onHotspotMarkersAdded;
		mediator.subscribe(_MODULE_ID, subscriptions);

		require([helper.getCurrentLangFile()], function(L) {
			_L = L;

			var tmpl = _.template(sidebarTemplate, {
				L: _L,
				resultsPanelHeight: 0
			});

			// render the template
			$("#sidebar").html(tmpl);

			// initialize the geocoder, used to convert human addresses into something more useful
			_geocoder = new google.maps.Geocoder();

			// make a note of the DOM nodes
			_locationField             = $("#location");
			_resultTypeGroup           = $("#resultTypeGroup");
			_resultTypeField           = $("input[name=resultType]");
			_searchOptionsLink         = $("#searchOptionsLink");
			_observationRecencySection = $("#observationRecencySection");
			_observationRecencyField   = $("#observationRecency");
			_observationRecencyDisplay = $("#observationRecencyDisplay");
			_hotspotActivitySection    = $("#hotspotActivitySection");
			_limitHotspotsByObservationRecency = $("#limitHotspotsByObservationRecency");
			_hotspotActivityRecencyDisplay = $("#hotspotActivityRecencyDisplay");
			_hotspotActivity           = $("#hotspotActivity");
			_searchBtn                 = $("#searchBtn");

			// add all relevant event handlers for the sidebar content
			_addEventHandlers();
		});
	};


	var _addEventHandlers = function() {
		_autoComplete = new google.maps.places.Autocomplete(_locationField[0]);
		google.maps.event.addListener(_autoComplete, 'place_changed', _onAutoComplete);
		$(_locationField[0]).on("keydown", function(e) {
			if (e.keyCode == 13) {
				e.preventDefault();
			}
		});

		_searchBtn.on("click", _submitForm);
		_observationRecencyField.on("change", _onChangeRecencyField);
		_hotspotActivity.on("change", _onChangeHotspotActivityField);
		_resultTypeGroup.on("change", "li", _onClickResultTypeGroupRow);
		_searchOptionsLink.on("click", _toggleSearchOptions);

		var searchResults = $("#sidebarResults");
		searchResults.on("mouseover", "#sidebarResultsTable tbody tr", _onHoverLocationRow);
		searchResults.on("mouseout", "#sidebarResultsTable tbody tr", _onHoverOutLocationRow);
		searchResults.on("click", "#sidebarResultsTable tbody tr", _onClickHotspotRow);
	};


	var _onAutoComplete = function() {
		var currPlace = _autoComplete.getPlace();

		if (!currPlace.geometry) {
			return;
		}
		_viewportObj = currPlace.geometry.hasOwnProperty("viewport") ? currPlace.geometry.viewport : null;
		_locationObj = currPlace.geometry.location;

		// keep track of the specificity of the last search. Depending on the search type (all, notable, hotspots)
		// it may not be valid
		_lastSearchNumAddressComponents = null;
		if (_locationField[0].value !== '' && currPlace !== null) {
			_lastSearchNumAddressComponents = currPlace.address_components.length;
		}
	};


	var _onChangeRecencyField = function(e) {
		_observationRecencyDisplay.html(e.target.value);
	};


	var _onChangeHotspotActivityField = function(e) {
		_hotspotActivityRecencyDisplay.html(e.target.value);
		_limitHotspotsByObservationRecency.prop("checked", true);
	};


	var _onClickResultTypeGroupRow = function(e) {
		e.stopImmediatePropagation();

		var clickedLi = e.currentTarget;
		var newResultType = $(clickedLi).find("input").val();
		if (newResultType === _currResultType) {
			return;
		}

		var els = $("#resultTypeGroup li");
		for (var i=0; i<els.length; i++) {
			$(els[i]).removeClass("selected");
		}
		$(clickedLi).addClass("selected").find("input").attr("checked", "checked");

		// if the search options section is expanded, hide/show the appropriate elements
		if (_searchOptionsEnabled) {
			if (_currResultType === "all" || _currResultType === "notable") {
				$("#observationRecencySection").hide();
			}
			if (_currResultType === "hotspots") {
				$("#hotspotActivitySection").hide();
			}
			if (newResultType === "all" || newResultType === "notable") {
				$("#observationRecencySection").show();
			}
			if (newResultType === "hotspots") {
				$("#hotspotActivitySection").show();
			}
		}

		mediator.publish(_MODULE_ID, C.EVENT.SEARCH_TYPE_CHANGED, {
			oldSearchType: _currResultType,
			newSearchType: newResultType
		});

		_currResultType = newResultType;
	};


	var _toggleSearchOptions = function(e) {
		e.preventDefault();

		var resultTypeValue = _getResultType();
		if (resultTypeValue === "all" || resultTypeValue === "notable") {
			if (_searchOptionsEnabled) {
				// temporarily increase the height of the sidebar results so there isn't a gap as the options slide up
				$("#sidebarResults").css({height: _getSidebarResultsPanelHeight() + 40 });
				$("#observationRecencySection").hide("blind", _onSearchOptionsToggled);
			} else {
				$("#observationRecencySection").show("blind", _onSearchOptionsToggled);
			}
		} else if (resultTypeValue === "hotspots") {
			if (_searchOptionsEnabled) {
				$("#sidebarResults").css({height: _getSidebarResultsPanelHeight() + 40 });
				$("#hotspotActivitySection").hide("blind", _onSearchOptionsToggled);
			} else {
				$("#hotspotActivitySection").show("blind", _onSearchOptionsToggled);
			}
		}

		// update the link text
		if (_searchOptionsEnabled) {
			_searchOptionsLink.html(_L.more_search_options);
		} else {
			_searchOptionsLink.html(_L.hide_search_options);
		}

		_searchOptionsEnabled = !_searchOptionsEnabled;
	};

	var _onSearchOptionsToggled = function() {
		$("#sidebarResults").css({height: _getSidebarResultsPanelHeight() });
	};


	/**
	 * Called after the used does a Notable Sightings search and whatever locations were found
	 * were just added to the map. This displays a "X locations found" message and shows a table
	 * of all the locations. Due to the limitations of the eBird API, we need to make separate requests
	 * for each and every location returned.
	 * @param msg
	 * @private
	 */
	var _onBirdMarkersAdded = function(msg) {

		// this contains JUST the locations - not any sightings info
		_visibleLocations = msg.data.locations;

		// store the hotspot data. This will probably contain more results than are currently
		// needed to display, according to the current viewport. That's cool. The map code
		// figures out what needs to be shown and ignores the rest.

		if ($.isArray(_visibleLocations) && _visibleLocations.length > 0) {
			for (var i=0; i<_visibleLocations.length; i++) {
				var locationID = _visibleLocations[i].locationID;
				if (!_birdSearchHotspots.hasOwnProperty(locationID)) {
					_birdSearchHotspots[locationID] = _visibleLocations[i];
				}
			}

			var locationStr = "locations";
			if (_visibleLocations.length === 1) {
				locationStr = "location";
			}

			var message = "<b>" + _visibleLocations.length + "</b> " + locationStr;
			helper.showMessage(message, "notification");
			_numVisibleLocations = _visibleLocations.length;
			_generateAsyncSidebarTable();

		} else {
			helper.showMessage(_L.no_results_found, 'notification');
			$("#sidebarResults").fadeOut(300);
			helper.stopLoading();
		}
	};


	/**
	 * Called after the used does a Notable Sightings search and whatever locations were found
	 * were just added to the map. This displays a "X locations found" message and shows a table
	 * of all the locations
	 * @param msg
	 * @private
	 */
	var _onNotableMarkersAdded = function(msg) {
		var locations = msg.data.locations;
		var numMarkers = locations.length;
		var locationStr = "location";
		if (numMarkers === 0 || numMarkers > 1) {
			locationStr = "locations";
		}

		// total up the total number of sightings made at the various locations
		var numSightings = 0;
		for (var i=0; i<numMarkers; i++) {
			numSightings += locations[i].sightings.length;
		}

		var sightingsStr = "sighting";
		if (numMarkers === 0 || numMarkers > 1) {
			sightingsStr = "sightings";
		}

		var message = "<b>" + numMarkers + "</b> " + locationStr + ", " +
			          "<b>" + numSightings + "</b> " + sightingsStr;

		helper.showMessage(message, "notification");
		_generateSidebarTable(locations, { showSpeciesColumn: true });
	};


	/**
	 * Called after the used does a Popular Birding Locations search and whatever hotspots were found
	 * were just added to the map. This displays a "X locations found" message and shows a table
	 * of all the hotspots.
	 * @param msg
	 * @private
	 */
	var _onHotspotMarkersAdded = function(msg) {
		var numMarkers = msg.data.hotspots.length;
		var locationStr = "location";
		if (numMarkers == 0 || numMarkers > 1) {
			locationStr  = "locations";
		}
		helper.showMessage("<b>" + numMarkers + "</b> " + locationStr + " found", "notification");
		_generateSidebarTable(msg.data.hotspots);
	};


	var _generateSidebarTable = function(visibleHotspots, options) {
		var opts = $.extend({
			showCheckboxColumn: false,
			showSpeciesColumn: false
		}, options);

		if (visibleHotspots.length > 0) {
			var tmpl = _.template(sidebarResultsTableTemplate, {
				showCheckboxColumn: opts.showCheckboxColumn,
				showSpeciesColumn: opts.showSpeciesColumn,
				hotspots: visibleHotspots,
				asyncLoading: false,
				L: _L
			});
			$("#sidebarResults").html(tmpl).removeClass("hidden").css({height: _getSidebarResultsPanelHeight() }).fadeIn(300);
			_sortTable("#sidebarResultsTable");
		} else {

			$("#sidebarResults").addClass("hidden");
		}
	};


	var _generateAsyncSidebarTable = function(visibleHotspots) {
		var templateData = [];
		for (var i=0; i<_numVisibleLocations; i++) {
			var row = _visibleLocations[i];

			var currLocationID = _visibleLocations[i].locationID;
			row.rowClass = "";
			row.numSpeciesWithinRange = "";

			if (!_birdSearchHotspots[currLocationID].hasOwnProperty("sightings") || !_birdSearchHotspots[currLocationID].sightings.data[_lastSearchObsRecency-1].available) {
				row.rowClass = "notLoaded";
			} else {
				row.numSpeciesWithinRange = _birdSearchHotspots[currLocationID].sightings.data[_lastSearchObsRecency-1].numSpeciesRunningTotal;
			}
			templateData.push(row);
		}

		// add the table to the page
		var tmpl = _.template(sidebarResultsTableTemplate, {
			L: _L,
			asyncLoading: true,
			showSpeciesColumn: true,
			hotspots: templateData
		});
		$("#sidebarResults").html(tmpl).removeClass("hidden").css({height: _getSidebarResultsPanelHeight() }).fadeIn(300);

		// instantiate any spinners for rows that haven't loaded yet
		var notLoaded = $(".notLoaded .speciesCount");
		for (var i=0; i<notLoaded.length; i++) {
			Spinners.create($(notLoaded[i])[0], {
				radius: 3,
				height: 4,
				width: 1.4,
				dashes: 12,
				opacity: 1,
				padding: 0,
				rotation: 1400,
				fadeOutSpeed: 0,
				color: "#222222"
			}).play();
		}

		_getBirdHotspotObservations();
	};


	var _submitForm = function(e) {
		e.preventDefault();

		if (_validateSearchForm()) {
			helper.startLoading();

			var searchType = _getResultType();
			if (searchType === "all" || searchType === "notable") {
				_lastSearchObsRecency = _observationRecencyField.val();
			} else {
				_lastSearchObsRecency = _hotspotActivity.val();
			}

			// since the search options are really very basic, just send along all possible info needed
			mediator.publish(_MODULE_ID, C.EVENT.INIT_SEARCH, {
				location: _locationField.val(),
				resultType: _getResultType(),
				observationRecencyField: _observationRecencyField.val(), // TODO... errr?

				// additional info aboutDialog the Map needed to center & zoom the map
				viewportObj: _viewportObj,
				locationObj: _locationObj,

				searchOptions: {
					allAndNotable: {
						observationRecency: _observationRecencyField.val()
					},
					hotspots: {
						limitByObservationRecency: _limitHotspotsByObservationRecency.prop("checked"),
						observationRecency: _hotspotActivity.val()
					}
				}
			});
		}
	};

	var _validateSearchForm = function() {
		var location =_locationField[0].value;
		var resultType = _getResultType();

		if (location === "") {
			helper.showMessage(_L.please_enter_location, "error");
			return false;
		}
		if (!_viewportObj && !_locationObj) {
			helper.showMessage(_L.please_select_location_from_dropdown, "error");
			return false;
		}
		if (resultType === "all" && _lastSearchNumAddressComponents < 3) {
			helper.showMessage(_L.please_enter_more_specific_location, "error");
			return false;
		}
		if (resultType == "hotspots" && _lastSearchNumAddressComponents < 3) {
			helper.showMessage(_L.please_enter_more_specific_location, "error");
			return false;
		}
		if (resultType == "notable" && _lastSearchNumAddressComponents < 2) {
			helper.showMessage(_L.please_enter_more_specific_location, "error");
			return false;
		}
		return true;
	};


	var _onResize = function(msg) {
		//if (msg.data.viewportMode === "desktop") {
		//	$('#sidebar').css('height', msg.data.height - 60);
		//} else {
		//	$('#sidebar').css('height', 'auto');
		//}
		//$("#hotspotTable").css({
		//	height: _getSidebarResultsPanelHeight
		//});
	};


	var _getSidebarResultsPanelHeight = function() {
		if (_sidebarResultPanelOffsetHeight === null) {
			var headerHeight = $("header").height(); // won't change
			var messageBar   = $("#messageBar").height(); // won't change
			var padding      = 50;
			_sidebarResultPanelOffsetHeight = headerHeight + messageBar + padding;
		}

		var searchPanel  = $("#searchPanel").height();
		var windowHeight = $(window).height();
		return windowHeight - (_sidebarResultPanelOffsetHeight + searchPanel);
	};


	var _getResultType = function() {
		return _resultTypeField.filter(":checked").val();
	};


	var _onHoverLocationRow = function(e) {
		var id = $(e.currentTarget).attr("id");
		if (id) {
			_currentMouseoverLocationID = id.replace(/^location_/, '');
			mediator.publish(_MODULE_ID, C.EVENT.LOCATION_MOUSEOVER, {
				locationID: _currentMouseoverLocationID
			});
		}
	};


	var _onHoverOutLocationRow = function() {
		if (_currentMouseoverLocationID !== null) {
			mediator.publish(_MODULE_ID, C.EVENT.LOCATION_MOUSEOUT, {
				locationID: _currentMouseoverLocationID
			});
		}
		_currentMouseoverLocationID = null;
	};


	// TODO rename
	var _onClickHotspotRow = function() {
		if (_currentMouseoverLocationID === null) {
			return;
		}

		var params = {
			locationID: _currentMouseoverLocationID
		};

		if (_currResultType === "all") {
			params.numSpecies = _birdSearchHotspots[_currentMouseoverLocationID].sightings.data[_lastSearchObsRecency-1].numSpeciesRunningTotal;
		}

		mediator.publish(_MODULE_ID, C.EVENT.LOCATION_CLICK, params);
	};


	var _getBirdHotspotObservations = function() {
		var hasAtLeastOneRequest = false;
		for (var i=0; i<_numVisibleLocations; i++) {
			var currLocationID = _visibleLocations[i].locationID;

			// check allHotspots to see if this data has been loaded yet. If not, prep the object. To reduce
			// server requests, we intelligently categorize all sightings into an array, where the index-1 === the day.
			// That way, if the user does a search for 30 days then reduces the recency setting, we don't need any
			// superfluous requests. If a request for 30 days goes through, ALL properties have their available property
			// set to true
			if (!_birdSearchHotspots[currLocationID].hasOwnProperty("sightings")) {
				_birdSearchHotspots[currLocationID].isDisplayed = false;
				_birdSearchHotspots[currLocationID].sightings = {
					success: null,
					data: $.extend(true, [], _sightingsArray)
				};
			}

			// if we already have the hotspot data available, just update the sidebar table
			if (_birdSearchHotspots[currLocationID].sightings.data[_lastSearchObsRecency-1].available) {
				_updateVisibleLocationInfo(currLocationID, _birdSearchHotspots[currLocationID].sightings.data[_lastSearchObsRecency-1].numSpeciesRunningTotal);
			} else {
				_getSingleHotspotObservations(currLocationID);
				hasAtLeastOneRequest = true;
			}
		}

		// if we didn't just put through a new request, the user just searched a subset of what's already been loaded
		if (!hasAtLeastOneRequest) {
			_sortTable("#sidebarResultsTable");
			helper.stopLoading();

			var locations = _getVisibleLocationData();
			mediator.publish(_MODULE_ID, C.EVENT.BIRD_SIGHTINGS_LOADED, {
				birdData: locations,
				observationRecency: _lastSearchObsRecency
			});
		}
	};
	

	var _getVisibleLocationData = function() {
		var locIds = [];
		for (var i=0; i<_visibleLocations.length; i++) {
			locIds.push(_visibleLocations[i].locationID);
		}

		var locationData = {};
		for (var i=0; i<locIds.length; i++) {
			locationData[locIds[i]] = _birdSearchHotspots[locIds[i]];
		}
		return locationData;
	};


	var _onErrorReturnLocationObservations = function(locationID, response) {
		_birdSearchHotspots[locationID].sightings.success = false;
		if (_checkAllObservationsLoaded()) {
			helper.stopLoading();
		}
	};


	mediator.register(_MODULE_ID, {
		init: _init
	});
});
