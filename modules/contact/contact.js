define([
	"manager",
	"constants",
	"text!contactTemplate"
], function(manager, C, template) {

	var MODULE_ID = "contact";

	var _init = function() {
		var subscriptions = {};
		subscriptions[C.EVENT.CONTACT_LINK_CLICK] = _openContactModal;
		manager.subscribe(MODULE_ID, subscriptions)
	};

	var _openContactModal = function() {
		$.modal(template);
	};

	manager.register(MODULE_ID, {
		init: _init
	});
});