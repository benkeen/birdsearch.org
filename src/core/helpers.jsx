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
const getBestBounds = (viewport, bounds) => {
	var locationObj = (viewport) ? viewport : bounds;
	var topRight = locationObj.getNorthEast();
	var bottomLeft = locationObj.getSouthWest();

	return {
		north: topRight.lat(),
		south: bottomLeft.lat(),
		east: topRight.lng(),
		west: bottomLeft.lng()
	};
};


// helper method to find out the total number of unique species sighted in a group of locations for a particular
// observation recency (e.g. the last 7 days). Returns null if any of the rows haven't been loaded yet
const getUniqueSpeciesInLocationList = (locations, sightings, obsRecency) => {
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
};


// return the species seen for a particular location and observation recency
const getLocationSpeciesList = (locationID, sightings, obsRecency) => {
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
};


const getLocationIDs = (locations) => {
	return _.pluck(locations, 'i');
};


const filterLocations = (locations, filter) => {
	if (!filter) {
		return locations;
	}
	var regexp = new RegExp(filter, 'i');
	return _.filter(locations, function (locInfo) {
		return regexp.test(locInfo.n);
	});
};


const getLocationById = (locations, locationId) => {
	return _.findWhere(locations, { i: locationId });
};


const getSightings = (locations, sightings, obsRecency, targetLocationID = null) => {
	var locationIDs = getLocationIDs(locations);
	var dataBySpecies = {};
	var numSpecies = 0;

	_.each(locationIDs, (locationID) => {
		var currLocationSpeciesInfo = getLocationSpeciesList(locationID, sightings, obsRecency);
		if (targetLocationID === null || locationID === targetLocationID) {
			_.each(currLocationSpeciesInfo.species, function (info, sciName) {
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
			});
		}

		// now append ALL locations for the found species
		_.each(currLocationSpeciesInfo.species, function (info, sciName) {
			if (_.has(dataBySpecies, sciName)) {
				dataBySpecies[sciName].locations.push({locName: info.locName, locID: info.locID, subID: info.subID });
			}
		});
	});

	// now convert the sightings into an array
	var sightingsData = _.values(dataBySpecies);
	sightingsData.sort(function(a, b) { return (a.comName.toLowerCase() > b.comName.toLowerCase()) ? 1 : -1; });

	var results = _.map(sightingsData, function (sighting) {
		var lastObservation = 0;
		var howManyArray = [];
		var lastSeenArray = [];

		_.each(sighting.obs, function (observation) {
			var observationTimeUnix = parseInt(moment(observation.obsDt, 'YYYY-MM-DD HH:mm').format("X"), 10);
			if (observationTimeUnix > lastObservation) {
				lastObservation = observationTimeUnix;

				// TODO drop the second one
				sighting.mostRecentObservation = moment(observation.obsDt, 'YYYY-MM-DD HH:mm');
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

	return results;
};


const getNotableSightings = (locations, sightings, obsRecency, targetLocationID = null) => {
	const locationIDs = _.pluck(locations, 'i');

	const data = [];
	_.each(sightings, (sightingData, locationID) => {
		if (!sightingData.fetched) {
			return;
		}
		if (locationIDs.indexOf(locationID) === -1) {
			return;
		}

		for (let i=0; i<obsRecency; i++) {
			let daySightings = sightingData.data[i].obs;
			for (let j=0; j<daySightings.length; j++) {
				console.log(daySightings[j]);
			}
		}
	});

	return data;
};

const highlightString = (string, filter) => {
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
};


const sortLocations = (locations, locationSightings, observationRecency, sort, sortDir, filter) => {
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
				return 10000 - sightings.data[observationRecency - 1].runningTotal;
			}
			return 10000;
		});
	}

	if (sortDir === C.SORT_DIR.REVERSE) {
		sortedLocations.reverse();
	}

	return filterLocations(sortedLocations, filter);
};


const getNumLoadedLocations = (locations, sightings) => {
	var count = 0;

	_.each(locations, function (location) {
		if (sightings[location.i].fetched) {
			count++;
			//return 10000 - sightings.data[observationRecency - 1].runningTotal;
		}
	});

	return count;
};


const queryParams = (source) => {
	const array = [];
	for (var key in source) {
		array.push(encodeURIComponent(key) + "=" + encodeURIComponent(source[key]));
	}
	return array.join("&");
};


const getPacketSize = (numLocations) => {
	let packetSize = 1;
	if (numLocations < 10) {
		packetSize = 2;
	} else if (numLocations < 20) {
		packetSize = 3;
	} else {
		packetSize = 4;
	}
	return packetSize;
};


const chunkArray = (arr, chunkSize) => {
	const chunkedArray = [];
	for (let i=0; i<arr.length; i+=chunkSize) {
		chunkedArray.push(arr.slice(i, i+chunkSize));
	}
	return chunkedArray;
};


export {
	getBestBounds,
	getLocationIDs,
	getUniqueSpeciesInLocationList,
	filterLocations,
	getLocationSpeciesList,
	getLocationById,
	getSightings,
	getNotableSightings,
	highlightString,
	sortLocations,
	getNumLoadedLocations,
	queryParams,
	getPacketSize,
	chunkArray
};
