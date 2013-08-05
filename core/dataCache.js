/**
 * This acts as the sole, central repo for hotspot and observation data. It does all the
 * nitty gritty work with organizing the info into sane data structures so the rest of the
 * scripts can
 */
define([], function() {

	var _MODULE_ID = "dataCache";
	var _hotspotData = {};


	/*

	HOTSPOTS
	1. store all hotspots
	2. track recency

	Caching the hotspot locations that were spotted within a particular time period doesn't seem worthwhile.
	Soo.... we continue to store all the hotspot info in _hotspotData = {}; but

	hotspotRecencySearches = [1, 2, 15, 30];// this means those f
	hotspots = {

	}

	*/


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
	};

	var _formatHotspotData = function(data) {
		var hotspotData = [];
		for (var i=0; i<data.length; i++) {
			hotspotData.push({
				locationId: data[i].i,
				lat: data[i].la,
				lng: data[i].lg,
				n: data[i].n
			});
		}
		return hotspotData;
	};

	return {
		getHotspots: _getHotspots,
		formatHotspotData: _formatHotspotData,
		getHotspotObservations: _getHotspotObservations,
		getHotspotNotableObservations: _getHotspotNotableObservations,
		storeData: _storeData
	};
});