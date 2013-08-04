/**
 * This contains
 */
define([
	"mediator",
	"lang_en" // TODO
], function(mediator, L) {

	var _MODULE_ID = "brain";
	var _currLangFile = "lang_en";

	var _init = function() {

	};

	mediator.register(_MODULE_ID, {
		init: _init
	});

	return {
		L: L
	};
});