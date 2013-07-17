define([
	"manager",
	"constants",
	"text!aboutTemplate"
], function(manager, C, template) {

	var MODULE_ID = "header";

	var _init = function() {
		var subscriptions = {};
		subscriptions[C.EVENT.ABOUT_LINK_CLICK] = _openAboutModal();
		manager.subscribe(MODULE_ID, subscriptions)
	};

	var _run = function() {
		$("header").html(template);
		_addEventHandlers();
	};

	var _openAboutModal = function() {
		console.log("open modal!");
	};

	manager.register(MODULE_ID, {
		run: _run
	});
});