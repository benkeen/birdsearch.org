define([
	"manager",
	"constants",
	"text!footerTemplate"
], function(manager, C, template) {
	"use strict";

	var MODULE_ID = "footer";

	var _run = function() {
		$("footer").html(template);
	};

	manager.register(MODULE_ID, {
		run: _run
	});
});