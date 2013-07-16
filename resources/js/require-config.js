requirejs.config({
	baseUrl: './',
	paths: {
		"app-start": "resources/js/app-start",
		"header": "modules/header/header",
		"headerTemplate": "modules/header/header.html",

		'tablesorter': "resources/js/libs/jquery.tablesorter.min",
		'simplemodal': "resources/js/libs/jquery.simplemodal.min",
		"underscore": "resources/js/libs/underscore.min"
	},
	shim: {
		'tablesorter': "jquery",
		'simplemodal': "jquery"
	}
});
