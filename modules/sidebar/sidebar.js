define([
	"manager",
	"constants",
	"text!sidebarTemplate"
], function(manager, C, template) {
	"use strict";

	var _MODULE_ID = "sidebar";
	var _autoComplete;
	var _geocoder;
	var _lastSearchNumAddressComponents;

	// DOM nodes
	var _locationField;
	var _resultTypeField;
	var _observationRecencySection;
	var _observationRecencyField;
	var _observationRecencyDisplay;
	var _hotspotActivitySection;
	var _hotspotActivity;
	var _searchBtn;

	// misc globally things
	var _lat;
	var _lng;
	var _locationObj;
	var _viewportObj;


	var _init = function() {

		// keep track of when the window is resized
		var subscriptions = {};
		subscriptions[C.EVENT.WINDOW_RESIZE] = _resizeSidebar;
		subscriptions[C.EVENT.MAP.HOTSPOT_MARKERS_ADDED] = _onHotspotMarkersAdded;
		manager.subscribe(_MODULE_ID, subscriptions);

		var tmpl = _.template(template);

		// render the template
		$("#sidebar").html(tmpl);

		// initialize the geocoder, used to convert human addresses into something more useful
		_geocoder  = new google.maps.Geocoder();

		// make a note of the DOM nodes
		_locationField             = $("#location");
		_resultTypeField           = $("#resultType");
		_observationRecencySection = $("#observationRecencySection");
		_observationRecencyField   = $("#observationRecency");
		_observationRecencyDisplay = $("#observationRecencyDisplay");
		_hotspotActivitySection    = $("#hotspotActivitySection");
		_hotspotActivity           = $("#hotspotActivity");
		_searchBtn                 = $("#searchBtn");

		_addEventHandlers();

		// now focus on the location field on page load
		_locationField.focus();
	};

	var _addEventHandlers = function() {
		_autoComplete = new google.maps.places.Autocomplete(_locationField[0]);

		// executed whenever the user selects a place through the auto-complete function
		google.maps.event.addListener(_autoComplete, 'place_changed', _onAutoComplete);
		_searchBtn.on("click", _submitForm);

		_observationRecencyField.on("change", _onChangeRecencyField);
		_resultTypeField.on("change", _onChangeResultType);
	};

	var _onAutoComplete = function() {
		var currPlace = _autoComplete.getPlace();
		_lat = currPlace.geometry.location.lat();
		_lng = currPlace.geometry.location.lng();
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

	var _onChangeResultType = function(e) {
		if (e.target.value === "hotspots") {
			_observationRecencySection.hide();
		} else {
			_observationRecencySection.show();
		}
	};

	var _onChangeRecencyField = function(e) {
		var dayOrDays = (e.target.value === "1") ? "day" : "days";
		_observationRecencyDisplay.html(e.target.value + " " + dayOrDays);
	};

	var _onHotspotMarkersAdded = function(msg) {
		var numMarkers = msg.data.numMarkers;
		var locationStr = 'location';
		if (numMarkers > 1) {
			locationStr  = 'locations';
		}
		manager.showMessage('<b>' + numMarkers + '</b> ' + locationStr + ' found', 'notification');
	};

	var _submitForm = function(e) {
		e.preventDefault();

		if (_validateSearchForm()) {
			manager.startLoading();
			manager.publish(_MODULE_ID, C.EVENT.SEARCH, {
				location: _locationField.val(),
				resultType: _resultTypeField.val(),
				observationRecencyField: _observationRecencyField.val(),
				lat: _lat,
				lng: _lng,

				// additional info needed to center & zoom the map
				viewportObj: _viewportObj,
				locationObj: _locationObj
			});
		}
	};

	var _validateSearchForm = function() {
		if (_locationField[0].value === '') {
			manager.showMessage('Please enter a location.', 'error');
			return false;
		}
		if (_resultTypeField[0].value === "all" && _lastSearchNumAddressComponents < 3) {
			manager.showMessage('Please enter a more specific location.', 'error');
			return false;
		}
		if ($.inArray(_resultTypeField[0].value, ["notable", "hotspots"]) !== -1 && _lastSearchNumAddressComponents < 2) {
			manager.showMessage('Please enter a more specific location.', 'error');
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


	manager.register(_MODULE_ID, {
		init: _init
	});
});