/**
 * This contains assorted helper functionality for use by the module. It includes stuff like
 * hiding/showing the loading spinner and getting the language strings in whatever language
 * is currently selected.
 */
define([
	"mediator",
	"lang_en" // TODO
], function(mediator, L) {

	var _MODULE_ID = "moduleHelper";
	var _currLangFile = "lang_en";
	var _spinner = null;

	var _init = function() {

	};

	// not terribly elegant, but functional. This needs to wait until the sidebar has been
	// created before the spinner can be initialized.
	var _initSpinner = function() {
		if (_spinner !== null) {
			return;
		}
		_spinner = Spinners.create($("#loadingSpinner")[0], {
			radius: 5,
			height: 7,
			width: 1.5,
			dashes: 14,
			opacity: 1,
			padding: 0,
			rotation: 1400,
			fadeOutSpeed: 0,
			color: '#efefef',
			pauseColor: '#444444',
			pauseOpacity: 1
		}).pause();
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
		_spinner.play();
	};

	var _stopLoading = function() {
		_spinner.pause();
	};

	mediator.register(_MODULE_ID, {
		init: _init
	});


	return {
		L: L,
		initSpinner: _initSpinner,
		showMessage: _showMessage,
		startLoading: _startLoading,
		stopLoading: _stopLoading
	};
});