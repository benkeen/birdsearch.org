requirejs.config({
	baseUrl: '',
	paths: {

		// core stuff
		"app-start": "core/app-start",
		"manager": "core/manager",
		"dataCache": "core/dataCache",
		"page": "core/page",
		"constants": "core/constants",

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
		'tablesorter': "libs/jquery.tablesorter.min",
		'simplemodal': "libs/jquery.simplemodal",
		"underscore": "libs/underscore.min"
	},
	shim: {
		'tablesorter': "jquery",
		'simplemodal': "jquery"
	}
});
