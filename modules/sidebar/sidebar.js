define([
	"manager",
	"constants",
	"text!sidebarTemplate"
], function(manager, C, template) {

	var MODULE_ID = "sidebar";

	var _run = function() {
		$("#sidebar").html(template);
		_addEventHandlers();
	};

	var _addEventHandlers = function() {

	};

	manager.register(MODULE_ID, {
		run: _run
	});
});