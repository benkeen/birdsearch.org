define([], function() {

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


	var _formatHotspotData = function(data) {
		var hotspotData = [];
		for (var i=0; i<data.length; i++) {
			hotspotData.push({
				locationID: data[i].i,
				lat: data[i].la,
				lng: data[i].lg,
				n: data[i].n
			});
		}
		return hotspotData;
	};

	var _formatNotableSightingsData = function(data) {
		var notableSightingsData = [];
		var foundLocations = [];

		for (var i=0; i<data.length; i++) {
			var currLocationID = data[i].locID;
			if ($.inArray(currLocationID, foundLocations) === -1) {
				foundLocations.push(currLocationID);
				console.log("adding: ", data[i]);
				notableSightingsData.push({
					locationID: currLocationID,
					lat: data[i].lat,
					lng: data[i].lng,
					n: data[i].n
				});
			}
		}
		return notableSightingsData;
	};

	return {
		getHotspots: _getHotspots,
		formatHotspotData: _formatHotspotData,
		formatNotableSightingsData: _formatNotableSightingsData
	};
});