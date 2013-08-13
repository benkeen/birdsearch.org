define([
	"mediator",
	"constants",
	"moduleHelper",
	"text!sidebarTemplate",
	"text!sidebarResultsTable",
	"text!birdSightingsSidebarTableTemplate"
], function(mediator, C, helper, sidebarTemplate, sidebarResultsTableTemplate, birdSightingsSidebarTableTemplate) {
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
	var _speciesInVisibleHotspots = {};
	var _numSpeciesInVisibleHotspots = 0;


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

		var tmpl = _.template(sidebarTemplate, {
			L: helper.L
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

		// if need be, progressively enhance the slider for browser that don't support that element
		_fixSliders();

		// initialize the main spinner
		helper.initSpinner();

		// focus on the location field on page load. Seems like this should be part of the moduleHelper... maybe that
		// should fire a "complete" even to which this module listens?
		_locationField.focus();

		// initialize the sightings array. This is deep copied when
		for (var i=0; i<C.SETTINGS.NUM_SEARCH_DAYS; i++) {
			_sightingsArray.push({ available: false, data: [], numSpecies: 0, numSpeciesRunningTotal: 0 });
		}
	};


	var _addEventHandlers = function() {
		_autoComplete = new google.maps.places.Autocomplete(_locationField[0]);
		google.maps.event.addListener(_autoComplete, 'place_changed', _onAutoComplete);

		_searchBtn.on("click", _submitForm);
		_observationRecencyField.on("change", _onChangeRecencyField);
		_hotspotActivity.on("change", _onChangeHotspotActivityField);
		_resultTypeGroup.on("change", "li", _onClickResultTypeGroupRow);
		_searchOptionsLink.on("click", _toggleSearchOptions);

		var searchResults = $("#fullPageSearchResults");
		searchResults.on("mouseover", "#hotspotTableBody tr", _onHoverLocationRow);
		searchResults.on("mouseout", "#hotspotTableBody tr", _onHoverOutLocationRow);
		searchResults.on("click", "#hotspotTableBody tr", _onClickHotspotRow);
	};


	// if there's no native support for the range element, offer the jQuery slider. Be nice if this dynamically downloaded the
	// resource as required... why penalize newer browsers?
	var _fixSliders = function() {
		if (!Modernizr.inputtypes.range){
			$("input[type=range]").each(function() {
				if ($(this).nextAll(".slider").length) {
					return;
				}
				var range = $(this);
				var id    = $(this).attr("id");

				var sliderDiv = $("<div class=\"slider\" />");
				sliderDiv.width(range.width());
				range.after(sliderDiv.slider({
					min:   parseFloat(range.attr("min")),
					max:   parseFloat(range.attr("max")),
					value: parseFloat(range.val()),
					step:  parseFloat(range.attr("step")),
					slide: function(e, ui) {
						range.val(ui.value);

						// this kind of sucks, but ...
						if (id === "observationRecency") {
							_observationRecencyDisplay.html(ui.value);
						} else if (id === "hotspotActivity") {
							_hotspotActivityRecencyDisplay.html(ui.value);
							_limitHotspotsByObservationRecency.prop("checked", true);
						}
					},

					change: function(e, ui) {
						range.val(ui.value);
						if (id === "observationRecency") {
							_observationRecencyDisplay.html(ui.value);
						} else if (id === "hotspotActivity") {
							_hotspotActivityRecencyDisplay.html(ui.value);
							_limitHotspotsByObservationRecency.prop("checked", true);
						}
					}
				}));
			}).hide();
		}
	};


	var _onAutoComplete = function() {
		var currPlace = _autoComplete.getPlace();
		_viewportObj = currPlace.geometry.viewport;
		_locationObj = currPlace.geometry.location;

		// keep track of the specificity of the last search. Depending on the search type (all, notable, hotspots)
		// it may not be valid
		_lastSearchNumAddressComponents = null;
		if (_locationField[0].value !== '' && currPlace !== null) {
			if (!currPlace.geometry) {
				return;
			}
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
				$("#observationRecencySection").hide("blind");
			} else {
				$("#observationRecencySection").show("blind");
			}
		} else if (resultTypeValue === "hotspots") {
			if (_searchOptionsEnabled) {
				$("#hotspotActivitySection").hide("blind");
			} else {
				$("#hotspotActivitySection").show("blind");
			}
		}

		// update the link text
		if (_searchOptionsEnabled) {
			_searchOptionsLink.html("More search options &raquo;");
		} else {
			_searchOptionsLink.html("&laquo; Hide search options");
		}

		_searchOptionsEnabled = !_searchOptionsEnabled;
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
		_visibleLocations = msg.data.locations;

		// store the hotspot data. This will probably contain more results than are currently
		// needed to display, according to the current viewport. That's cool. The map code
		// figures out what needs to be shown and ignores the rest.
		if ($.isArray(_visibleLocations)) {

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
			helper.showMessage('No birding locations found', 'notification');
			$("#searchResults").fadeOut(300);
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
				L: helper.L,
				height: _getSidebarResultsPanelHeight()
			});
			$("#fullPageSearchResults").html(tmpl).removeClass("hidden").fadeIn(300);
		} else {
			$("#fullPageSearchResults").addClass("hidden");
		}
	};


	var _generateAsyncSidebarTable = function(visibleHotspots) {
		var templateData = [];
		for (var i=0; i<_numVisibleLocations; i++) {
			var row = _visibleLocations[i];

			var currLocationID = _visibleLocations[i].locationID;
			row.rowClass = "";
			row.numSpeciesWithinRange = "";
			if (!_birdSearchHotspots[currLocationID].hasOwnProperty("sightings")) {
				row.rowClass = "notLoaded";
			} else {
				row.numSpeciesWithinRange = _birdSearchHotspots[currLocationID].sightings.data[_lastSearchObsRecency].numSpeciesRunningTotal;
			}

			templateData.push(row);
		}

		// add the table to the page
		var tmpl = _.template(birdSightingsSidebarTableTemplate, {
			L: helper.L,
			height: _getSidebarResultsPanelHeight(),
			hotspots: templateData
		});
		$("#fullPageSearchResults").html(tmpl).removeClass("hidden").fadeIn(300);

		_getBirdHotspotObservations();
	};


	var _submitForm = function(e) {
		e.preventDefault();

		if (_validateSearchForm()) {
			helper.startLoading();

			var searchType = _getResultType();
			if (searchType === "all" || searchType === "notasble") {
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
			helper.showMessage("Please enter a location.", "error");
			return false;
		}
		if (!_viewportObj || !_locationObj) {
			helper.showMessage("Please select a location from the auto-completed location field.", "error");
			return false;
		}
		if (resultType === "all" && _lastSearchNumAddressComponents < 3) {
			helper.showMessage("Please enter a more specific location.", "error");
			return false;
		}
		if (resultType == "hotspots" && _lastSearchNumAddressComponents < 3) {
			helper.showMessage("Please enter a more specific location.", "error");
			return false;
		}
		if (resultType == "notable" && _lastSearchNumAddressComponents < 2) {
			helper.showMessage("Please enter a more specific location.", "error");
			return false;
		}
		return true;
	};


	var _onResize = function(msg) {
		if (msg.data.viewportMode === "desktop") {
			$('#sidebar').css('height', msg.data.height - 77);
		} else {
			$('#sidebar').css('height', 'auto');
		}

		$("#hotspotTableRows").css({
			height: _getSidebarResultsPanelHeight
		});
	};


	var _getSidebarResultsPanelHeight = function() {
		if (_sidebarResultPanelOffsetHeight === null) {
			var headerHeight  = $("header").height(); // won't change
			var messageBar    = $("#messageBar").height(); // won't change
			var footerHeight  = $("footer").height(); // won't change
			var padding = 80;
			_sidebarResultPanelOffsetHeight = headerHeight + messageBar + footerHeight + padding;
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


	var _onClickHotspotRow = function() {
		mediator.publish(_MODULE_ID, C.EVENT.LOCATION_CLICK, {
			locationID: _currentMouseoverLocationID
		});
	};



	// -------------------------------------------------------------------------------------
	// all old code


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
			if (_birdSearchHotspots[currLocationID].sightings.data[i].available) {
				_updateVisibleLocationInfo(currLocationID);
			} else {
				_getSingleHotspotObservations(currLocationID);
				hasAtLeastOneRequest = true;
			}
		}

		// if we didn't just put through a new request, the user just searched a subset of what's already been loaded
		if (!hasAtLeastOneRequest) {
			// let the tablesort know to re-parse the hotspot table
			$('#hotspotTable').trigger("update").trigger("appendCache");
			helper.stopLoading();

			// publish shit here!
//			manager.updateSpeciesData();
//			manager.updateSpeciesTab();
		}
	};


	var _getSingleHotspotObservations = function(locationID) {
		$.ajax({
			url: "ajax/getHotspotSightings.php",
			data: {
				locationID: locationID,
				recency: _lastSearchObsRecency
			},
			type: "POST",
			dataType: "json",
			success: function(response) {
				_onSuccessReturnLocationObservations(locationID, response);
			},
			error: function(response) {
				_onErrorReturnLocationObservations(locationID, response);
			}
		});
	};


	/**
	 * Returns the observations reports for a single location at a given interval (last 2 days, last 30 days
	 * etc). This can be called multiple times for a single location if the user keeps increasing the recency
	 * range upwards. Once the user's returned data for a location for 30 days, it contains everything it needs
	 * so no new requests are required.
	 */
	var _onSuccessReturnLocationObservations = function(locationID, response) {
		_birdSearchHotspots[locationID].isDisplayed = true;
		_birdSearchHotspots[locationID].sightings.success = true;

		// by reference, of course
		var sightings = _birdSearchHotspots[locationID].sightings;

		// mark the information as now available for this observation recency + and anything below,
		// and reset the observation data (it's about to be updated below)
		for (var i=C.SETTINGS.NUM_SEARCH_DAYS-1; i>=0; i--) {
			sightings[i] = { available: true, data: [], numSpecies: 0, numSpeciesRunningTotal: 0 };
		}

		// now for the exciting part: loop through the observations and put them in the appropriate spot
		// in the data structure
		var speciesCount = response.length;
		for (var i=0; i<speciesCount; i++) {
			var observationTime = parseInt(moment(response[i].obsDt, "YYYY-MM-DD HH:mm").format("X"), 10);
			var difference = _CURRENT_SERVER_TIME - observationTime;
			var daysAgo = Math.ceil(difference / _ONE_DAY_IN_SECONDS); // between 1 and 30
			sightings[daysAgo-1].data.push(response[i]);
		}

		// we've added all the observation data, set the numSpecies counts
		for (var i=0; i<sightings.length; i++) {
			sightings[i].numSpecies = sightings[i].data.length;
		}

		// now add the numSpeciesRunningTotal property. This is the running total seen in that time
		// range: e.g. 3 days would include the total species seen in that day, and 2 days and 1 day

		var uniqueSpecies = {};
		var numUniqueSpecies = 0;
		for (var i=0; i<C.SETTINGS.NUM_SEARCH_DAYS; i++) {
			var sightings = _birdSearchHotspots[locationID].sightings[i].data;
			for (var j=0; j<sightings.length; j++) {
				if (!uniqueSpecies.hasOwnProperty(sightings[j].sciName)) {
					uniqueSpecies[sightings[j].sciName] = null;
					numUniqueSpecies++;
				}
			}
			_birdSearchHotspots[locationID].sightings[i].numSpeciesRunningTotal = numUniqueSpecies;
		}

		_updateVisibleLocationInfo(locationID, response.length);

		if (_checkAllObservationsLoaded()) {
//			manager.updateSpeciesTab();

			// let the tablesort know to re-parse the hotspot table
			$("#hotspotTable").trigger("update").trigger("appendCache");
			helper.stopLoading();

			console.log("loaded");
		}
	};


	var _onErrorReturnLocationObservations = function(locationID, response) {
		_birdSearchHotspots[locationID].observations.success = false;
		if (_checkAllObservationsLoaded()) {
			helper.stopLoading();
		}
	};


	/**
	 * Helper function to update the location's row in the sidebar table and the map modal.
	 */
	var _updateVisibleLocationInfo = function(locationID, numSpecies) {
		var title = numSpecies + ' bird species seen at this location in the last ' + _lastSearchObsRecency + ' days.';
		var row = $("#location_" + locationID);
		row.removeClass("notLoaded").addClass("loaded");

		if (numSpecies > 0) {
			row.find('.speciesCount').html(numSpecies).attr('title', title);
		}
	};


	/**
	 * Called any time the selected data changes. This updates the Bird Species tab and tab content.
	var _updateSpeciesData = function() {
		_speciesInVisibleHotspots = {};
		_numSpeciesInVisibleHotspots = 0;

		for (var i=0; i<_numVisibleLocations; i++) {
			var currLocationID = _visibleLocations[i];

			// if this hotspots observations failed to load (for whatever reason), just ignore the row
			if (!_birdSearchHotspots[currLocationID].sightings.success) {
				continue;
			}

			var currLocationSpeciesInfo = _getLocationSpeciesList(currLocationID, manager.searchType, manager.observationRecency);
			for (var speciesSciName in currLocationSpeciesInfo.species) {
				var currData = currLocationSpeciesInfo.species[speciesSciName];
				if (!manager.speciesInVisibleHotspots.hasOwnProperty(speciesSciName)) {
					manager.speciesInVisibleHotspots[speciesSciName] = {
						comName: currData.comName,
						sciName: speciesSciName,
						obs: []
					};
					manager.numSpeciesInVisibleHotspots++;
				}

				manager.speciesInVisibleHotspots[speciesSciName].obs.push({
					howMany: currData.howMany,
					lat: currData.lat,
					lng: currData.lng,
					locID: currData.locID,
					locName: currData.locName,
					obsDt: currData.obsDt,
					obsReviewed: currData.obsReviewed,
					obsValid: currData.obsValid
				});
			}
		}
	};
	 */

	/**
	 * Called after any observations has been returned. It looks through all of data.hotspots
	 * and confirms every one has an observations property (they are added after a response - success
	 * or failure).
	 */
	var _checkAllObservationsLoaded = function() {
		var allLoaded = true;
		for (var i=0; i<_numVisibleLocations; i++) {
			var currLocationID = _visibleLocations[i].locationID;

			// if any of the visible hotspots haven't had a success/fail message for their observation
			// list, we ain't done
			if (_birdSearchHotspots[currLocationID].observations.success === null) {
				allLoaded = false;
				break;
			}
		}

		return allLoaded;
	};

	mediator.register(_MODULE_ID, {
		init: _init
	});
});