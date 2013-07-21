define([
	"manager",
	"constants",
	"text!sidebarTemplate"
], function(manager, C, template) {

	var _MODULE_ID = "sidebar";
	var _autoComplete;
	var _geocoder;

	// DOM nodes
	var _locationField;
	var _resultTypeField;
	var _observationRecencyField;
	var _searchBtn;


	var _init = function() {

		// keep track of when the window is resized
		var subscriptions = {};
		subscriptions[C.EVENT.WINDOW_RESIZE] = _resizeSidebar;
		manager.subscribe(_MODULE_ID, subscriptions);

		// render the template
		$("#sidebar").html(template);

		// initialize the geocoder (used to convert human addresses into something more usable)
		_geocoder  = new google.maps.Geocoder();

		// make a note of the DOM nodes
		_locationField           = $("#location")[0];
		_resultTypeField         = $("#resultType")[0];
		_observationRecencyField = $("#observationRecency")[0];
		_searchBtn               = $("#searchBtn")[0];

		_addEventHandlers();
	};

	var _addEventHandlers = function() {

		_autoComplete = new google.maps.places.Autocomplete(_locationField);
		//_autocomplete.bindTo('bounds', _el);

		// executed whenever the user selects a place through the auto-complete function
		google.maps.event.addListener(_autoComplete, 'place_changed', _onAutoComplete);
	};

	var _onAutoComplete = function() {

		// assume the worst. When the user submits the search form, we'll check it was valid or not
		//_lastAddressSearchValid = false;
		//_currPlace = _autocomplete.getPlace();

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