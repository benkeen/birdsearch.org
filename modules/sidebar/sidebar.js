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
		subscriptions[C.EVENT.WINDOW_RESIZE] = _resizeSidebar;
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
	};


	// if there's no native support for the range element, offer the jQuery slider
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
							_limitHotspotsByObservationRecency.prop("checked", true);						}
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
	 * Called after the used does a Popular Birding Locations search and whatever hotspots were found
	 * were just added to the map. This displays a "X locations found" message and shows a table
	 * of all the hotspots.
	 * @param msg
	 * @private
	 */
	var _onHotspotMarkersAdded = function(msg) {
		var numMarkers = msg.data.numMarkers;
		var locationStr = "location";
		if (numMarkers == 0 || numMarkers > 1) {
			locationStr  = "locations";
		}

		helper.showMessage("<b>" + numMarkers + "</b> " + locationStr + " found", "notification");

		_generateHotspotTable(msg.data.hotspots);

		/*
		if (manager.numVisibleHotspots > 0) {
			var html = manager.generateHotspotTable(manager.visibleHotspots);
			var locationStr = 'location';
			if (manager.numVisibleHotspots > 1) {
				locationStr  = 'locations';
			}

			try {
				$('#hotspotTable').trigger("destroy");
			} catch (e) { }

			var numHotspotsStr = '';
			if (manager.maxHotspotsReached) {
				numHotspotsStr = manager.numVisibleHotspots + '+';
			} else {
				numHotspotsStr = manager.numVisibleHotspots;
			}

			helper.showMessage('<b>' + numHotspotsStr + '</b> ' + locationStr + ' found', 'notification');

			if (manager.currViewportMode === 'desktop') {
				$('#fullPageSearchResults').html(html).removeClass('hidden').fadeIn(300);
			} else {
				$('#locationsTabContent').html(html); //.removeClass('hidden').fadeIn(300);
				$('#locationsTab').removeClass('disabled').html('Locations <span>(' + manager.numVisibleHotspots + ')</span>');
			}
			$('#hotspotTable').tablesorter({
				headers: { 2: { sorter: 'species' } }
			});
		} else {
			helper.showMessage('No birding locations found', 'notification');
			$('#fullPageSearchResults').fadeOut(300);
			helper.stopLoading();
		}
		*/
	};

	var _generateHotspotTable = function(visibleHotspots) {

		console.log(visibleHotspots);

		var tmpl = _.template(hotspotTableTemplate, {
			showSpeciesColumn: false,
			hotspots: visibleHotspots,
			L: helper.L
		});

		$("#fullPageSearchResults").html(tmpl).removeClass("hidden").fadeIn(300);

		/*
		for (var i=0; i<visibleHotspots.length; i++) {
			var currLocationID = visibleHotspots[i];
			var rowClass = '';
			var checkedAttr = '';

			if (manager.allHotspots[currLocationID].isDisplayed) {
				rowClass = '';
				checkedAttr = 'checked="checked"';
			}
			var numSpeciesWithinRange = '';
			if (!manager.allHotspots[currLocationID].hasOwnProperty('observations')) {
				rowClass = ' notLoaded';
				checkedAttr = 'checked="checked"';
			} else {
				numSpeciesWithinRange = manager.allHotspots[currLocationID].observations[manager.searchType][manager.observationRecency + 'day'].numSpeciesRunningTotal;
			}

			html += '<tr id="location_' + currLocationID + '">' +
				'<td><input type="checkbox" id="row' + i + '" ' + checkedAttr + ' /></td>' +
				'<td class="loadingStatus' + rowClass + '">' + '<label for="row' + i + '">' + manager.allHotspots[currLocationID].n + '</label></td>' +
				'<td class="sp"><span class="speciesCount">' + numSpeciesWithinRange + '</span></td>' +
				'</tr>';
		}
		*/

	};



	var _submitForm = function(e) {
		e.preventDefault();

		if (_validateSearchForm()) {
			helper.startLoading();

			// since the search options are really very basic, just send along all possible info needed
			mediator.publish(_MODULE_ID, C.EVENT.SEARCH, {
				location: _locationField.val(),
				resultType: _getResultType(),
				observationRecencyField: _observationRecencyField.val(),

				// additional info about the Map needed to center & zoom the map
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
		if (resultType === "all" || resultType == "hotspots" && _lastSearchNumAddressComponents < 3) {
			helper.showMessage("Please enter a more specific location.", "error");
			return false;
		}
		if (resultType == "notable" && _lastSearchNumAddressComponents < 2) {
			helper.showMessage("Please enter a more specific location.", "error");
			return false;
		}
		return true;
	};

	var _resizeSidebar = function(msg) {
		if (msg.data.viewportMode === "desktop") {
			$('#sidebar').css('height', msg.data.height - 77);
		} else {
			$('#sidebar').css('height', 'auto');
		}
	};

	var _getResultType = function() {
		return _resultTypeField.filter(":checked").val();
	};

	mediator.register(_MODULE_ID, {
		init: _init
	});
});