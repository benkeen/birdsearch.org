define([], function() {

	var _CONSTANTS = {};

	_CONSTANTS.DEBUG = false;

	_CONSTANTS.CORE = {
		APP_VERSION:  "1.0.1",
		RELEASE_DATE: "",
		GITHUB_URL:   "https://github.com/benkeen/eBirdsearch.org"
	};

	_CONSTANTS.EVENT = {
		ABOUT_LINK_CLICK: "about-link-click",
		CONTACT_LINK_CLICK: "contact-link-click",
		SELECT_TAB: "select-tab",
		WINDOW_RESIZE: "window-resize",
		TRIGGER_WINDOW_RESIZE: "trigger-window-resize"
	};

	return _CONSTANTS;
});