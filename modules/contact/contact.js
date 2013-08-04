define([
	"mediator",
	"constants",
	"text!contactTemplate"
], function(mediator, C, template) {

	var _MODULE_ID = "contact";

	var _init = function() {
		var subscriptions = {};
		subscriptions[C.EVENT.CONTACT_LINK_CLICK] = _openContactModal;
		mediator.subscribe(_MODULE_ID, subscriptions)
	};

	var _openContactModal = function() {
		$.modal(template);
	};

	mediator.register(_MODULE_ID, {
		init: _init
	});
});