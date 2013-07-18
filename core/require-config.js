requirejs.config({
	baseUrl: '',
	paths: {
		"app-start": "core/app-start",
		"manager": "core/manager",
		"constants": "core/constants",
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

		'tablesorter': "libs/jquery.tablesorter.min",
		'simplemodal': "libs/jquery.simplemodal",
		"underscore": "libs/underscore.min"
	},
	shim: {
		'tablesorter': "jquery",
		'simplemodal': "jquery"
	}
});
