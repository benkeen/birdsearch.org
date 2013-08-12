requirejs.config({
	baseUrl: '',
	paths: {

		// core stuff
		text: "libs/text",
		appStart: "core/appStart",
		mediator: "core/mediator",
		dataCache: "core/dataCache",
		page: "core/page",
		constants: "core/constants",
		moduleHelper: "core/moduleHelper",

		// page components
		header: "modules/header/header",
		headerTemplate: "modules/header/header.html",
		footer: "modules/footer/footer",
		footerTemplate: "modules/footer/footer.html",
		sidebar: "modules/sidebar/sidebar",
		sidebarTemplate: "modules/sidebar/sidebar.html",
		hotspotTable: "modules/sidebar/hotspotTable.html",
		aboutDialog: "modules/aboutDialog/about",
		aboutTemplate: "modules/aboutDialog/about.html",

		mainPanel: "modules/mainPanel/mainPanel",
		mainPanelTemplate: "modules/mainPanel/mainPanel.html",
		notableSightingsTableTemplate: "modules/mainPanel/notableSightingsTable.html",

		map: "modules/map/map",
		allSightingsInfoWindowTemplate: "modules/map/allSightingsInfoWindow.html",
		notableSightingsInfoWindowTemplate: "modules/map/notableSightingsInfoWindow.html",

		// helpers
		"tablesorter": "libs/jquery.tablesorter.min",
		"simplemodal": "libs/jquery.simplemodal",
		"underscore": "libs/underscore.min",
		"moment": "libs/moment.min",

		// language files
		"lang_en": "lang/en",
		"lang_fr": "lang/fr",
		"lang_de": "lang/de",
		"lang_es": "lang/es"
	},
	shim: {
		'tablesorter': "jquery",
		'simplemodal': "jquery"
	}
});
