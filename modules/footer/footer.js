define([
	"manager",
	"constants",
	"underscore",
	"text!footerTemplate"
], function(manager, C, _, template) {
	"use strict";

	var _MODULE_ID = "footer";

	var _run = function() {
		var tmpl = _.template(template, {
			githubUrl: C.CORE.GITHUB_URL,
			appVersion: C.CORE.APP_VERSION
		});
		$("footer").html(tmpl);
	};

	manager.register(_MODULE_ID, {
		run: _run
	});
});