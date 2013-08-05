requirejs.config({
	baseUrl: '',
	paths: {

		// core stuff
		"appStart": "core/appStart",
		"mediator": "core/mediator",
		"dataCache": "core/dataCache",
		"page": "core/page",
		"constants": "core/constants",
		"moduleHelper": "core/moduleHelper",

		// page components
		"header": "modules/header/header",
		"headerTemplate": "modules/header/header.html",
		"footer": "modules/footer/footer",
		"footerTemplate": "modules/footer/footer.html",
		"sidebar": "modules/sidebar/sidebar",
		"sidebarTemplate": "modules/sidebar/sidebar.html",
		"about": "modules/about/about",
		"aboutTemplate": "modules/about/about.html",
		"contact": "modules/contact/contact",
		"contactTemplate": "modules/contact/contact.html",
		"mainPanel": "modules/mainPanel/mainPanel",
		"mainPanelTemplate": "modules/mainPanel/mainPanel.html",
		"map": "modules/map/map",

		// helpers
		"tablesorter": "libs/jquery.tablesorter.min",
		"simplemodal": "libs/jquery.simplemodal",
		"underscore": "libs/underscore.min",

		// language files
		"lang_en": "lang/en",
		"lang_fr": "lang/fr",
		"lang_de": "lang/de"
	},
	shim: {
		'tablesorter': "jquery",
		'simplemodal': "jquery"
	}
});
