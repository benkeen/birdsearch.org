define([
	"constants"
], function(C) {

	var _modules = {};


	var _start = function() {
		_initAll();
		_runAll();
	};

	var _initAll = function() {
		for (var i in _modules) {
			_modules[i].init();
		}
	};

	var _runAll = function() {
		for (var i in _modules) {
			_modules[i].run();
		}
	};

	var _register = function(moduleID, settings) {
		var moduleConfig = $.extend({
			init: function() { },
			run: function() { },
			subscriptions: {}
		}, settings);

		_modules[moduleID] = moduleConfig;
	};

	var _publish = function() {

	};

	var _subscribe = function(MODULE_ID, subscriptions) {
		_modules[MODULE_ID] = subscriptions;
	};

	return {
		start: _start,
		register: _register,
		publish: _publish,
		subscribe: _subscribe
	};
});