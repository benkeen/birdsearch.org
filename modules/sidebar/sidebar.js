define([
	"mediator",
	"constants",
	"text!sidebarTemplate"
], function(mediator, C, template) {
	"use strict";

	var _MODULE_ID = "sidebar";
	var _autoComplete;
	var _geocoder;
	var _lastSearchNumAddressComponents;
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
		mediator.subscribe(_MODULE_ID, subscriptions);

		var tmpl = _.template(template);

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
		_hotspotActivity           = $("#hotspotActivity");
		_searchBtn                 = $("#searchBtn");

		// add all relevant event handlers for the sidebar content
		_addEventHandlers();

		// focus on the location field on page load. Seems like this should be part of the moduleHelper... maybe that
		// should fire a "complete" even to which this module listens?
		_locationField.focus();
	};


	var _addEventHandlers = function() {
		_autoComplete = new google.maps.places.Autocomplete(_locationField[0]);
		google.maps.event.addListener(_autoComplete, 'place_changed', _onAutoComplete);

		_searchBtn.on("click", _submitForm);
		_observationRecencyField.on("change", _onChangeRecencyField);
		_resultTypeGroup.on("click", "li", _onClickResultTypeGroupRow);
		_searchOptionsLink.on("click", _toggleSearchOptions);
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

	var _onChangeRecencyField = function(e) {
		_observationRecencyDisplay.html(e.target.value);
	};

	var _onClickResultTypeGroupRow = function(e) {

		// can't prevent default because the native label-click action to check the radio won't occur
		//e.preventDefault();

		console.log($("#resultTypeGroup li input:checked").val());
		var currentLi = e.currentTarget;
		var els = $("#resultTypeGroup li");
		for (var i=0; i<els.length; i++) {
			$(els[i]).removeClass("selected");
//			$(els[i]).find("input").removeAttr("checked");
		}

		//$(currentLi).addClass("selected").find("input").attr("checked", "checked");

		if (e.currentTarget.value === "hotspots") {
			_observationRecencySection.hide("fade");
		} else {
			_observationRecencySection.show("fade");
		}
	};

	var _onHotspotMarkersAdded = function(msg) {
		var numMarkers = msg.data.numMarkers;
		var locationStr = "location";
		if (numMarkers > 1) {
			locationStr  = "locations";
		}

		// move to moduleHelper
		mediator.showMessage("<b>" + numMarkers + "</b> " + locationStr + " found", "notification");
	};

	var _submitForm = function(e) {
		e.preventDefault();
		if (_validateSearchForm()) {
			mediator.startLoading();
			mediator.publish(_MODULE_ID, C.EVENT.SEARCH, {
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
			mediator.showMessage('Please enter a location.', 'error');
			return false;
		}
		if (_resultTypeField[0].value === "all" && _lastSearchNumAddressComponents < 3) {
			mediator.showMessage('Please enter a more specific location.', 'error');
			return false;
		}
		if ($.inArray(_resultTypeField[0].value, ["notable", "hotspots"]) !== -1 && _lastSearchNumAddressComponents < 2) {
			mediator.showMessage('Please enter a more specific location.', 'error');
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

	var _toggleSearchOptions = function(e) {
		e.preventDefault();

		var resultTypeValue = _resultTypeField.filter(":checked").val();
		if (resultTypeValue === "all") {
			if (_searchOptionsEnabled) {
				$("#observationRecencySection").fadeOut();
			} else {
				$("#observationRecencySection").fadeIn();
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

	mediator.register(_MODULE_ID, {
		init: _init
	});
});