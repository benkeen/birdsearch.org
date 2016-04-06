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
	var data = _.times(30, function () {
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
	var uniqueSpeciesInAllLocations = {};
	var numUniqueSpeciesInAllLocations = 0;
	var locationIDs = getLocationIDs(locations);
	var allFetched = true;

	_.each(locationIDs, function (locationID) {
		if (!sightings[locationID].fetched) {
			allFetched = false;
			return;
		}

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

	return {
		count: numUniqueSpeciesInAllLocations,
		allFetched: allFetched
	};
}


// return the species seen for a particular location and observation recency
function getLocationSpeciesList (locationID, sightings, obsRecency) {
	if (!_.has(sightings, locationID)) {
		return false;
	}

	var species = {};
	var numSpecies = 0;
	_.times(obsRecency, function (index) {
		if (!sightings[locationID].fetched) {
			return;
		}
		var observations = sightings[locationID].data[index].obs;
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


function getSightings (locations, sightings, obsRecency, targetLocationID = null) {
	var locationIDs = getLocationIDs(locations);

	var dataBySpecies = {};
	var numSpecies = 0;

	_.each(locationIDs, function (locationID) {
		if (targetLocationID !== null && locationID !== targetLocationID) {
			return;
		}

		var currLocationSpeciesInfo = getLocationSpeciesList(locationID, sightings, obsRecency);
		_.each(currLocationSpeciesInfo.species, function (info, sciName) {

			//// if this location's observations failed to load (for whatever reason), just ignore the row
			//if (!_birdData[locationID].sightings.success) {
			//	continue;
			//}

			if (!_.has(dataBySpecies, sciName)) {
				dataBySpecies[sciName] = {
					comName: info.comName,
					sciName: sciName,
					obs: [],
					locations: [],
					mostRecentObservationTime: null,
					howManyCount: 0
				};
				numSpecies++;
			}
			dataBySpecies[sciName].obs.push({
				howMany: info.howMany,
				lat: info.lat,
				lng: info.lng,
				locID: info.locID,
				locName: info.locName,
				obsDt: info.obsDt,
				obsReviewed: info.obsReviewed,
				obsValid: info.obsValid
			});

			dataBySpecies[sciName].locations.push({ locName: info.locName, locID: info.locID });
		});
	});

	// now convert the sightings into an array
	var sightingsData = _.values(dataBySpecies);
	sightingsData.sort(function(a, b) { return (a.comName.toLowerCase() > b.comName.toLowerCase()) ? 1 : -1; });

	return _.map(sightingsData, function (sighting) {
		var lastObservation = 0;
		var howManyArray = [];
		var lastSeenArray = [];

		_.each(sighting.obs, function (observation) {
			var observationTimeUnix = parseInt(moment(observation.obsDt, 'YYYY-MM-DD HH:mm').format("X"), 10);
			if (observationTimeUnix > lastObservation) {
				lastObservation = observationTimeUnix;
				sighting.mostRecentObservationTime = moment(observation.obsDt, 'YYYY-MM-DD HH:mm').format('MMM Do, H:mm a');
			}
			lastSeenArray.push(moment(observation.obsDt, 'YYYY-MM-DD HH:mm').format('MMM Do, H:mm a'));

			var howMany = observation.howMany || "-";
			if (howMany.toString().match(/\D/g)) {
				howManyArray.push("-");
			} else {
				howManyArray.push(observation.howMany);
				sighting.howManyCount += parseInt(observation.howMany, 10);
			}
		});

		sighting.howManyArray = howManyArray;
		sighting.lastSeenArray = lastSeenArray;

		return sighting;
	});
}


function highlightString (string, filter) {
	if (filter === '') {
		return {
			match: true,
			string: string
		};
	}
	var regexp = new RegExp('(' + filter + ')', 'gi');

	var data = {
		match: regexp.test(string),
		string: string
	};
	if (data.match) {
		data.string = string.replace(regexp, '<span class="highlight">$1</span>');
	}
	return data;
}


function sortLocations (locations, locationSightings, observationRecency, sort, sortDir, filter) {
	var sortedLocations = locations;

	// apply the appropriate sort
	if (sort === C.LOCATION_SORT.FIELDS.LOCATION) {
		sortedLocations = _.sortBy(locations, function (locInfo) { return locInfo.n; });
	} else {
		// the 10000 thing is a bit weird, but basically we just need to sort the species count from largest to smallest
		// when the user first clicks the column. That does it.
		sortedLocations = _.sortBy(locations, function (locInfo) {
			var sightings = locationSightings[locInfo.i];
			if (sightings.fetched) {
				return 10000 - sightings.data[observationRecency - 1].numSpeciesRunningTotal;
			}
			return 10000;
		});
	}

	if (sortDir === C.SORT_DIR.REVERSE) {
		sortedLocations.reverse();
	}

	return filterLocations(sortedLocations, filter);
}


export {
	getBestBounds,
	parseHotspotSightings,
	getLocationIDs,
	getUniqueSpeciesInLocationList,
	filterLocations,
	getLocationSpeciesList,
	getLocationById,
	getSightings,
	highlightString,
	sortLocations
};
