define([
	"manager",
	"constants",
	"text!headerTemplate"
], function(manager, C, template) {
	"use strict";

	var _MODULE_ID = "header";


	var _run = function() {
		$("header").html(template);
		_addEventHandlers();
	};

	var _addEventHandlers = function() {
		$(document).on("click", "#aboutLink", function(e) {
			e.preventDefault();
			manager.publish(_MODULE_ID, C.EVENT.ABOUT_LINK_CLICK);
		});

		$(document).on("click", "#contactLink", function(e) {
			e.preventDefault();
			manager.publish(_MODULE_ID, C.EVENT.CONTACT_LINK_CLICK);
		});
	};

	manager.register(_MODULE_ID, {
		run: _run
	});
});