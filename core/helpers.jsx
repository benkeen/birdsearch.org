import { C, _ } from './core';
import moment from 'moment';


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


function parseHotspotSightings (sightings) {

	// lay down the defaults
	var data = _(30).times(function () {
		return { obs: [], numSpecies: 0, numSpeciesRunningTotal: 0 };
	});

	sightings.forEach(function (sighting) {
		var observationTime = parseInt(moment(sighting.obsDt, 'YYYY-MM-DD HH:mm').format('X'), 10);
		var difference = moment().format('X') - observationTime;

		// sometimes users seem to be able to input future-dated observations (presumably by screwing up AM + PM)
		// so daysAgo can, actually be zero. This prevents that edge case
		var daysAgo = Math.ceil(difference / C.ONE_DAY_IN_SECONDS); // between 1 and 30
		daysAgo = (daysAgo < 1) ? 1 : daysAgo;
		data[daysAgo - 1].obs.push(sighting);
	});

	// we've added all the observation data, set the numSpecies counts
	data.forEach(function (day, index) {
		data[index].numSpecies = data[index].obs.length;
	});

	// now set the numSpeciesRunningTotal property. This is the running total seen in that time
	// range: e.g. 3 days would include the total species seen on days 1-3, 4 days would have 1-4 etc.
	var uniqueSpecies = {};
	var numUniqueSpecies = 0;

	for (var i = 0; i < 30; i++) {
		var currDaySightings = data[i];
		for (var j = 0; j < currDaySightings.obs.length; j++) {
			if (_.has(uniqueSpecies, currDaySightings.obs[j].sciName)) {
				continue;
			}
			uniqueSpecies[currDaySightings.obs[j].sciName] = null;
			numUniqueSpecies++;
		}
		data[i].numSpeciesRunningTotal = numUniqueSpecies;
	}

	return data;
}


export {
		getBestBounds,
		parseHotspotSightings
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
