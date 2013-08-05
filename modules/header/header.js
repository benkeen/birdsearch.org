define([
	"mediator",
	"constants",
	"underscore",
	"moduleHelper",
	"text!headerTemplate"
], function(mediator, C, _, helper, template) {
	"use strict";

	var _MODULE_ID = "header";


	var _run = function() {
		var tmpl = _.template(template, {
			L: helper.L
		});
		$("header").html(tmpl);
		_addEventHandlers();
	};

	var _addEventHandlers = function() {
		$("#aboutLink").on("click", function(e) {
			e.preventDefault();
			mediator.publish(_MODULE_ID, C.EVENT.ABOUT_LINK_CLICK);
		});

		$("#contactLink").on("click", function(e) {
			e.preventDefault();
			mediator.publish(_MODULE_ID, C.EVENT.CONTACT_LINK_CLICK);
		});

		$("#lang").on("click", function() {
			// do stuff
		});
	};

	mediator.register(_MODULE_ID, {
		run: _run
	});
});