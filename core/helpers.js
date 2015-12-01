/**
 * This contains assorted helper functionality for use by the module. It includes stuff like
 * hiding/showing the loading spinner and getting the language strings in whatever language
 * is currently selected.
 */

var _spinner = null;

var _init = function () { };
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
	var $messageBar = $("#messageBar");
	if ($messageBar.hasClass('visible')) {
		$messageBar.removeClass().addClass(messageType + ' visible').html(message);
	} else {
		$messageBar.css("display", "none").removeClass().addClass(messageType + " visible").html(message).fadeIn(300);
	}
};

var _startLoading = function() {
	_spinner.play();
};

var _stopLoading = function() {
	_spinner.pause();
};

function getQueryStringParams() {
	var qs = (function(a) {
		if (a == "") return {};
		var b = {};
		for (var i = 0; i < a.length; ++i) {
			var p = a[i].split('=');
			if (p.length != 2) {
				continue;
			}
			b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
		}
		return b;
	})(window.location.search.substr(1).split("&"));

	return qs;
}


// exposed

export function getCurrentLangFile () {
	var params = getQueryStringParams();
	return (params.hasOwnProperty("lang")) ? "lang_" + params["lang"] : "lang_en";
}


//return {
//	getCurrentLangFile: _getCurrentLangFile,
//	getQueryStringParams: _getQueryStringParams,
//	initSpinner: _initSpinner,
//	showMessage: _showMessage,
//	startLoading: _startLoading,
//	stopLoading: _stopLoading
//};
