define([
	"mediator",
	"constants",
	"underscore",
	"moduleHelper",
	"text!headerTemplate"
], function(mediator, C, _, helper, template) {
	"use strict";

	var _MODULE_ID = "header";
	var _L = {};

	var _run = function() {
		var currentLangFile = helper.getCurrentLangFile();
		require([currentLangFile], function(L) {
			_L = L;
			var tmpl = _.template(template, {
				L: _L,
				currentLangFile: currentLangFile
			});
			$("header").html(tmpl);
			_addEventHandlers();
		});
	};

	var _addEventHandlers = function() {
		$("#aboutLink").on("click", function(e) {
			e.preventDefault();
			mediator.publish(_MODULE_ID, C.EVENT.ABOUT_LINK_CLICK);
		});

		$("#lang").on("change", function(e) {
			window.location = "?lang=" + $(e.target).val();
		});
	};

	mediator.register(_MODULE_ID, {
		run: _run
	});
});