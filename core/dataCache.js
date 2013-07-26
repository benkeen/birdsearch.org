/**
 * This acts as the sole, central repo for hotspot and observation data
 */
define([
	"manager"
], function(manager) {

	var _MODULE_ID = "dataCache";
	var _hotspotData = {};
	var _searchDays;


	// set up our data structure that's going to house all the data
	var _init = function() {
		_searchDays = manager.getSearchDays();
/*
		for (var i=0; i<searchDays.length; i++) {
			_hotspotData["day" + i] = {
				available: true,
				data: [],
				numSpecies: 0,
				numSpeciesRunningTotal: 0
			};
		}
*/
	};


	manager.register(_MODULE_ID, {
		init: _init
	});

	return {

	};
});