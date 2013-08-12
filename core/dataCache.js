// not e
define([
	"moment"
], function(moment) {

	var _MODULE_ID = "dataCache";
	var _hotspotData = {};


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

	/**
	 * @param data
	 * @private
	 */
	var _formatBirdSightingsData = function(data) {
		var locations = {};
		for (var i=0; i<data.length; i++) {
			var currLocationID = data[i].locID;
			if (!locations.hasOwnProperty(currLocationID)) {
				locations[currLocationID] = {
					locationID: currLocationID,
					lat: data[i].lat,
					lng: data[i].lng,
					n: data[i].locName,
					sightings: []
				};
			}

			locations[currLocationID].sightings.push({
				comName: data[i].comName,
				sciName: data[i].sciName,
				obsDt: moment(data[i].obsDt, 'YYYY-MM-DD HH:mm').format('MMM Do, h:mm a'),
				obsReviewed: data[i].obsReviewed,
				obsValid: data[i].obsValid,
				howMany: data[i].howMany,
			});
		}

		// now convert the info into an array
		var foundLocations = [];
		for (var locID in locations) {
			foundLocations.push(locations[locID]);
		}

		console.log(foundLocations);

		return foundLocations;
	};

	var _formatNotableSightingsData = function(data) {
		var notableSightingsData = {};

		for (var i=0; i<data.length; i++) {
			var currLocationID = data[i].locID;

			if (!notableSightingsData.hasOwnProperty(currLocationID)) {
				notableSightingsData[currLocationID] = {
					locationID: currLocationID,
					lat: data[i].lat,
					lng: data[i].lng,
					n: data[i].locName,
					sightings: []
				};
			}

			notableSightingsData[currLocationID].sightings.push({
				comName: data[i].comName,
				sciName: data[i].sciName,
				obsDt: moment(data[i].obsDt, 'YYYY-MM-DD HH:mm').format('MMM Do, h:mm a'),
				obsReviewed: data[i].obsReviewed,
				obsValid: data[i].obsValid,
				howMany: data[i].howMany,
				reporterName: data[i].firstName + " " + data[i].lastName
			});
		}

		// now convert the info into an array
		var foundLocations = [];
		for (var locID in notableSightingsData) {
			foundLocations.push(notableSightingsData[locID]);
		}

		return foundLocations;
	};

	return {
		getHotspots: _getHotspots,
		formatHotspotData: _formatHotspotData,
		formatNotableSightingsData: _formatNotableSightingsData,
		formatBirdSightingsData: _formatBirdSightingsData
	};
});