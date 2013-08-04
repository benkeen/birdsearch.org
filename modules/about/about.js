define([
	"mediator",
	"constants",
	"text!aboutTemplate"
], function(mediator, C, template) {

	var _MODULE_ID = "about";

	var _init = function() {
		var subscriptions = {};
		subscriptions[C.EVENT.ABOUT_LINK_CLICK] = _openAboutModal;
		mediator.subscribe(_MODULE_ID, subscriptions)
	};

	var _openAboutModal = function() {
		$.modal(template);
	};

	mediator.register(_MODULE_ID, {
		init: _init
	});
});