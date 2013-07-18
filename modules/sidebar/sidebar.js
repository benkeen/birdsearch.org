define([
	"manager",
	"constants",
	"text!sidebarTemplate"
], function(manager, C, template) {

	var MODULE_ID = "sidebar";
	var _autocomplete;

	// DOM nodes
	var _searchField;



	var _init = function() {
		$("#sidebar").html(template);
		_addEventHandlers();

		_searchField = $("");
	};

	var _run = function() {

	};

	var _addEventHandlers = function() {

		_autocomplete = new google.maps.places.Autocomplete(_searchField);
		_autocomplete.bindTo('bounds', _el);

		// executed whenever the user selects a place through the auto-complete function
		google.maps.event.addListener(_autocomplete, 'place_changed', _onAutoComplete);

	};

	manager.register(MODULE_ID, {
		init: _init
	});
});