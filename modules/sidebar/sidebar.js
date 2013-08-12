define([
	"mediator",
	"constants",
	"moduleHelper",
	"text!sidebarTemplate",
	"text!hotspotTable"
], function(mediator, C, helper, sidebarTemplate, hotspotTableTemplate) {
	"use strict";

	var _MODULE_ID = "sidebar";
	var _autoComplete;
	var _geocoder;
	var _lastSearchNumAddressComponents;
	var _currResultType = "all";
	var _searchOptionsEnabled = false;
	var _currentMouseoverLocationID = null;
	var _sidebarResultPanelOffsetHeight = null;

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


	var _init = function() {

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
	 * of all the locations
	 * @param msg
	 * @private
	 */
	var _onBirdMarkersAdded = function(msg) {
		var locations = msg.data.locations;
		var numMarkers = locations.length;
		var locationStr = "location";
		if (numMarkers === 0 || numMarkers > 1) {
			locationStr = "locations";
		}

		// total up the total number of species made at the various locations
		var species = {};
		var numSpecies = 0;
		for (var i=0; i<numMarkers; i++) {
			for (var j=0; j<locations[i].sightings.length; j++) {
				if (!species.hasOwnProperty(locations[i].sightings[j].sciName)) {
					species[locations[i].sightings[j].sciName] = null;
					numSpecies++;
				}
			}
		}

		var sightingsStr = "species";
		if (numSpecies === 0 || numSpecies > 1) {
			sightingsStr = "species";
		}

		var message = "<b>" + numMarkers + "</b> " + locationStr + ", " +
			"<b>" + numSpecies + "</b> " + sightingsStr;

		helper.showMessage(message, "notification");
		_generateSidebarTable(locations, { showSpeciesColumn: true });
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
			var tmpl = _.template(hotspotTableTemplate, {
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


	var _submitForm = function(e) {
		e.preventDefault();

		if (_validateSearchForm()) {
			helper.startLoading();

			// since the search options are really very basic, just send along all possible info needed
			mediator.publish(_MODULE_ID, C.EVENT.INIT_SEARCH, {
				location: _locationField.val(),
				resultType: _getResultType(),
				observationRecencyField: _observationRecencyField.val(),

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


	mediator.register(_MODULE_ID, {
		init: _init
	});
});