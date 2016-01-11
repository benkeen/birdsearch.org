
/**
 * Helper function to get the raw n/s/e/w coords for a particular Google Maps search result. See calling instances
 * for how it's used. With Google maps results `viewport` contains the recommended lat/lng bounds for the location.
 * In most cases it's the same as `bounds`; this method just wraps it and returns an object literal containing the
 * raw lat/lng coords.
 * @param viewport
 * @param bounds
 */
function getBestBounds (viewport, bounds) {
	var locationObj = (viewport) ? viewport : bounds;
	var topRight = locationObj.getNorthEast();
	var bottomLeft = locationObj.getSouthWest();
	return {
		north: topRight.lat(),
		south: bottomLeft.lat(),
		east: topRight.lng(),
		west: bottomLeft.lng()
	};
}

export {
		getBestBounds
};



/*
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
*/
