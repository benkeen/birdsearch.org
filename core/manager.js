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

	/**
	 * Publishes a message to anyone who's subscribed to it.
	 * @param moduleID
	 * @param message
	 * @param data
	 * @private
	 */
	var _publish = function(moduleID, message, data) {
		if (C.DEBUG) {
			console.log(moduleID + " published event: ", message);
		}

		for (var i in _modules) {
			var subscriptions = _modules[i].subscriptions;

			// if this module has subscribed to this event, call the callback function
			if (subscriptions.hasOwnProperty(message)) {
				subscriptions[message]({
					sender: moduleID,
					data: data
				});
			}
		}
	};

	var _subscribe = function(MODULE_ID, subscriptions) {
		_modules[MODULE_ID].subscriptions = subscriptions;
	};

	/**
	 * Shows the large message section in the left sidebar (desktop only).
	 */
	var _showMessage = function(message, messageType) {
		if ($("#messageBar").hasClass('visible')) {
			$("#messageBar").removeClass().addClass(messageType + ' visible').html(message);
		} else {
			$("#messageBar").css('display', 'none').removeClass().addClass(messageType + ' visible').html(message).fadeIn(300);
		}
	};

	var _startLoading = function() {
		$('#loadingSpinner').fadeIn(200);
	};

	var _stopLoading = function() {
		$('#loadingSpinner').fadeOut(200);
	};


	return {
		start: _start,
		register: _register,
		publish: _publish,
		subscribe: _subscribe,
		startLoading: _startLoading,
		stopLoading: _stopLoading,
		showMessage: _showMessage
	};
});