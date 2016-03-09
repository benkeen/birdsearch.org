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

// helper method to find out the total number of unique species sighted in a group of locations for a particular
// observation recency (e.g. the last 7 days). Returns null if any of the rows haven't been loaded yet
function getUniqueSpeciesInLocationList (locations, sightings, obsRecency) {
	var loaded = _.every(locations, function (location) {
		return sightings[location.i].fetched;
	}, this);
	if (!loaded) {
		return null;
	}

	var uniqueSpeciesInAllLocations = {};
	var numUniqueSpeciesInAllLocations = 0;
	var locationIDs = getLocationIDs(locations);

	_.each(locationIDs, function (locationID) {
		var sightingsData = sightings[locationID].data;
		_.times(obsRecency, function (index) {
			var currDaySightings = sightingsData[index].obs;
			_.each(currDaySightings, function (sighting) {
				if (!_.has(uniqueSpeciesInAllLocations, sighting.sciName)) {
					uniqueSpeciesInAllLocations[sighting.sciName] = null;
					numUniqueSpeciesInAllLocations++;
				}
			});
		});
	});

	return numUniqueSpeciesInAllLocations;
}

// return the species seen for a particular location and observation recency
function getLocationSpeciesList (locationID, sightings, obsRecency) {
	if (!_.has(sightings, locationID)) {
		return false;
	}

	var species = {};
	var numSpecies = 0;
	_.times(obsRecency, function (index) {
		var observations = sightings[locationID].sightings.data[index].obs;
		_.each(observations, function (obsInfo) {
			if (!species.hasOwnProperty(obsInfo.sciName)) {
				species[obsInfo.sciName] = obsInfo;
				numSpecies++;
			}
		});
	});

	return {
		numSpecies: numSpecies,
		species: species
	};
}

function getLocationIDs (locations) {
	return _.pluck(locations, 'i');
}

function filterLocations (locations, filter) {
	if (!filter) {
		return locations;
	}
	var regexp = new RegExp(filter, 'i');
	return _.filter(locations, function (locInfo) {
		return regexp.test(locInfo.n);
	});
}

function getLocationById (locations, locationId) {
	return _.findWhere(locations, { i: locationId });
}


function getSightings (locations, sightings, obsRecency) {
	var locationIDs = getLocationIDs(locations);

	var dataBySpecies = {};
	var numSpecies = 0;
	_.each(locationIDs, function (locationID) {
		var currLocationSpeciesInfo = getLocationSpeciesList(locationID, obsRecency);

		_.each(currLocationSpeciesInfo, function (key, value) {

			//// if this location's observations failed to load (for whatever reason), just ignore the row
			//if (!_birdData[locationID].sightings.success) {
			//	continue;
			//}

			var currData = currLocationSpeciesInfo.species[speciesSciName];

			if (!_.has(dataBySpecies, speciesSciName)) {
				dataBySpecies[speciesSciName] = {
					comName: currData.comName,
					sciName: speciesSciName,
					obs: [],
					locations: [],
					mostRecentObservationTime: null,
					howManyCount: 0
				};
				numSpecies++;
			}
			dataBySpecies[speciesSciName].obs.push({
				howMany: currData.howMany,
				lat: currData.lat,
				lng: currData.lng,
				locID: currData.locID,
				locName: currData.locName,
				obsDt: currData.obsDt,
				obsReviewed: currData.obsReviewed,
				obsValid: currData.obsValid
			});

			dataBySpecies[speciesSciName].locations.push(currData.locName);
		});
	});

	// now convert the sightings into an array
	var sightings = [];
	for (var sciName in dataBySpecies) {
		sightings.push(dataBySpecies[sciName]);
	}
	sightings.sort(function(a, b) { return (a.comName.toLowerCase() > b.comName.toLowerCase()) ? 1 : -1; });

	var updatedSightings = [];
	for (var i=0; i<sightings.length; i++) {
		var lastObservation = 0;
		var howManyArray = [];
		var lastSeenArray = [];
		for (var j=0; j<sightings[i].obs.length; j++) {
			var observationTimeUnix = parseInt(moment(sightings[i].obs[j].obsDt, 'YYYY-MM-DD HH:mm').format("X"), 10);
			if (observationTimeUnix > lastObservation) {
				lastObservation = observationTimeUnix;
				sightings[i].mostRecentObservationTime = moment(sightings[i].obs[j].obsDt, 'YYYY-MM-DD HH:mm').format('MMM Do, H:mm a');
			}
			lastSeenArray.push(moment(sightings[i].obs[j].obsDt, 'YYYY-MM-DD HH:mm').format('MMM Do, H:mm a'));

			howMany = sightings[i].obs[j].howMany || "-";
			if (howMany.toString().match(/\D/g)) {
				howManyCount = "-";
				howManyArray.push("-");
			} else {
				howManyArray.push(sightings[i].obs[j].howMany);
				sightings[i].howManyCount += parseInt(sightings[i].obs[j].howMany, 10);
			}
		}

		sightings[i].howManyArray = howManyArray;
		sightings[i].lastSeenArray = lastSeenArray;
		updatedSightings.push(sightings[i]);
	}

	return updatedSightings;
}


export {
	getBestBounds,
	parseHotspotSightings,
	getLocationIDs,
	getUniqueSpeciesInLocationList,
	filterLocations,
	getLocationSpeciesList,
	getLocationById,
	getSightings
};
