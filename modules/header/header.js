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
		$(document).on("click", "#aboutLink", function(e) {
			e.preventDefault();
			mediator.publish(_MODULE_ID, C.EVENT.ABOUT_LINK_CLICK);
		});

		$(document).on("click", "#contactLink", function(e) {
			e.preventDefault();
			mediator.publish(_MODULE_ID, C.EVENT.CONTACT_LINK_CLICK);
		});
	};

	mediator.register(_MODULE_ID, {
		run: _run
	});
});