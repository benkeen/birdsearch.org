define([
	"manager",
	"constants",
	"text!sidebarTemplate"
], function(manager, C, template) {

	var MODULE_ID = "sidebar";
	var _autocomplete;

	// DOM nodes
	var _searchField;
	var _searchBtn;


	var _init = function() {
		$("#sidebar").html(template);

		// make a note of the DOM nodes
		_searchField = $("#searchTextField")[0];
		_searchBtn   = $("#search")[0];

		//
		_addEventHandlers();
	};

	var _run = function() {

	};

	var _addEventHandlers = function() {

		_autocomplete = new google.maps.places.Autocomplete(_searchField);
		//_autocomplete.bindTo('bounds', _el);

		// executed whenever the user selects a place through the auto-complete function
		google.maps.event.addListener(_autocomplete, 'place_changed', _onAutoComplete);

	};

	var _onAutoComplete = function() {

		// assume the worst. When the user submits the search form, we'll check it was valid or not
		//_lastAddressSearchValid = false;
		//_currPlace = _autocomplete.getPlace();
	};


	manager.register(MODULE_ID, {
		init: _init
	});
});