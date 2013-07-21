define([
	"manager",
	"constants",
	"text!aboutTemplate"
], function(manager, C, template) {

	var _MODULE_ID = "about";

	var _init = function() {
		var subscriptions = {};
		subscriptions[C.EVENT.ABOUT_LINK_CLICK] = _openAboutModal;
		manager.subscribe(_MODULE_ID, subscriptions)
	};

	var _openAboutModal = function() {
		$.modal(template);
	};

	manager.register(_MODULE_ID, {
		init: _init
	});
});