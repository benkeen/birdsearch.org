define([
	"mediator",
	"constants",
	"underscore",
	"moduleHelper",
	"text!footerTemplate"
], function(mediator, C, _, helper, template) {
	"use strict";

	var _MODULE_ID = "footer";
	var _L = {};

	var _run = function() {
		require([helper.getCurrentLangFile()], function(L) {
			_L = L;
			var footerText = helper.L.site_not_affiliated_with_ebird.replace(/%1/, '<a href="http://ebird.org" target="_blank">eBird.org</a>');
			var tmpl = _.template(template, {
				githubUrl: C.CORE.GITHUB_URL,
				appVersion: C.CORE.APP_VERSION,
				footerText: footerText
			});
			$("footer").html(tmpl);
		});
	};

	mediator.register(_MODULE_ID, {
		run: _run
	});
});