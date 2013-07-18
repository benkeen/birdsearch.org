define([
	"manager",
	"constants",
	"underscore",
	"text!footerTemplate"
], function(manager, C, _, template) {
	"use strict";

	var _template;


	var MODULE_ID = "footer";

	var _run = function() {
		_template = _.template(template, {
			githubUrl: C.CORE.GITHUB_URL,
			appVersion: C.CORE.APP_VERSION
		});
		$("footer").html(_template);
	};

	manager.register(MODULE_ID, {
		run: _run
	});
});