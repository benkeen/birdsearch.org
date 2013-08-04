/**
 * This acts as the sole, central repo for hotspot and observation data
 */
define([
	"mediator" // pity
], function(mediator) {

	var _MODULE_ID = "dataCache";
	var _hotspotData = {};


	// set up our data structure that's going to house all the data
	var _init = function() {
		/*for (var i=0; i< C.SETTINGS.SEARCH_DAYS.length; i++) {
			_hotspotData["day" + C.SETTINGS.SEARCH_DAYS[i]] = {
				available: true,
				data: [],
				numSpecies: 0,
				numSpeciesRunningTotal: 0
			};
		}*/
	};

	var _getHotspots = function() {
		return _hotspotData;
	};

	var _getHotspotObservations = function() {

	};

	var _getHotspotNotableObservations = function() {

	};

	var _storeData = function(dataFormat, data) {
		if (dataFormat === "hotspots") {
			for (var i=0; i<data.length; i++) {
				var locationID = data[i].i;
				if (!_hotspotData.hasOwnProperty(locationID)) {
					_hotspotData[locationID] = {};
				}
				_hotspotData[locationID].hotspotInfo = {
					lat: data[i].la,
					lng: data[i].lg,
					n: data[i].n
				}
			}
		}
	};

	mediator.register(_MODULE_ID, {
		init: _init
	});

	return {
		getHotspots: _getHotspots,
		getHotspotObservations: _getHotspotObservations,
		getHotspotNotableObservations: _getHotspotNotableObservations,
		storeData: _storeData
	};
});