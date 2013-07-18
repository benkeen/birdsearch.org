define([
	"constants"
], function(C) {
	"use strict";

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
		if (_modules.hasOwnProperty(moduleID)) {
			console.warn("A module with this ID is already registered: ", moduleID);
			return;
		}

		var moduleConfig = $.extend({
			init: function() { },
			run: function() { },
			subscriptions: { }
		}, settings);

		_modules[moduleID] = moduleConfig;

		if (C.DEBUG) {
			console.log("registered: ", moduleID);
		}
	};

	var _publish = function(data) {
		var type = data.type;

		if (C.DEBUG) {
			console.log("publish event: ", type);
		}

		for (var i in _modules) {
			var subscriptions = _modules[i].subscriptions;

			// if this module has subscribed to this event, call the callback function
			if (subscriptions.hasOwnProperty(type)) {
				subscriptions[type]();
			}
		}
	};


	var _subscribe = function(MODULE_ID, subscriptions) {
		_modules[MODULE_ID].subscriptions = subscriptions;
	};


	return {
		start: _start,
		register: _register,
		publish: _publish,
		subscribe: _subscribe
	};
});