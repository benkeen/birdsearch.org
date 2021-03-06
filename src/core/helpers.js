import React from 'react';
import { C } from './core';
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

	locationIDs.forEach((locationID) => {
		if (!sightings[locationID].fetched) {
			allFetched = false;
			return;
		}

		var sightingsData = sightings[locationID].data;
		times(obsRecency, function (index) {
			var currDaySightings = sightingsData[index].obs;
			currDaySightings.forEach((sighting) => {
				if (!uniqueSpeciesInAllLocations.hasOwnProperty(sighting.sciName)) {
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
	if (!sightings.hasOwnProperty(locationID)) {
		return false;
	}

	var species = {};
	var numSpecies = 0;
	times(obsRecency, function (index) {
		if (!sightings[locationID].fetched) {
			return;
		}
		var observations = sightings[locationID].data[index].obs;
		observations.forEach((obsInfo) => {
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


const getLocationIDs = (locations) => arrayPluck(locations, 'i');


const filterLocations = (locations, filter) => {
	if (!filter) {
		return locations;
	}
	var regexp = new RegExp(filter, 'i');
	return locations.filter((locInfo) => regexp.test(locInfo.n));
};


const getLocationById = (locations, locationId) => {
	return locations.find((item) => item.i === locationId);
};


const getSightings = (locations, sightings, obsRecency, targetLocationID = null) => {
	let locationIDs = getLocationIDs(locations);
	let dataBySpecies = {};
	let allDataBySpecies = {}; // needed to figure out how many locations each species is at
	let numSpecies = 0;

	// gah! Super complicated.
	locationIDs.forEach((locationID) => {
		let currLocationSpeciesInfo = getLocationSpeciesList(locationID, sightings, obsRecency);

		// only include the species info if the users's looking as "All Locations", or if this current location
		// is the specific one
		Object.keys(currLocationSpeciesInfo.species).forEach((sciName) => {
			const info = currLocationSpeciesInfo.species[sciName];

			if (targetLocationID === null || locationID === targetLocationID) {
				if (!dataBySpecies.hasOwnProperty(sciName)) {
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
					locId: info.locId,
					locName: info.locName,
					obsDt: info.obsDt,
					obsReviewed: info.obsReviewed,
					obsValid: info.obsValid
				});
			}

			// allDataBySpecies is a temp var in this method used to contain ALL observation details for each species,
			// regardless of whether the user is viewing a specific location. This is used to show the full list of locations
			// where a species has been seen
			if (!allDataBySpecies.hasOwnProperty(sciName)) {
				allDataBySpecies[sciName] = [];
			}
			allDataBySpecies[sciName].push({ locId: info.locId, locName: info.locName, subId: info.subId });
		});
	});

	// now append ALL locations for the found species. TODO this only needs to change when the search does. It shouldn't be here.
	Object.keys(dataBySpecies).forEach((sciName) => {
		const uniqueLocations = [];

		allDataBySpecies[sciName].forEach((obsInfo) => {
			if (uniqueLocations.indexOf(obsInfo.locId) === -1) {
				uniqueLocations.push(obsInfo.locId);
				dataBySpecies[sciName].locations.push(obsInfo);
			}
		});
	});

	// now convert the sightings into an array
	var sightingsData = Object.values(dataBySpecies);
	sortAlpha(sightingsData, (obj) => obj.comName);

	var results = sightingsData.map((sighting) => {
		var lastObservation = 0;
		var howManyArray = [];
		var lastSeenArray = [];

		sighting.obs.forEach((observation) => {
			var observationTimeUnix = parseInt(moment(observation.obsDt, 'YYYY-MM-DD HH:mm').format("X"), 10);
			if (observationTimeUnix > lastObservation) {
				lastObservation = observationTimeUnix;
				sighting.mostRecentObservation = moment(observation.obsDt, 'YYYY-MM-DD HH:mm');
				sighting.mostRecentObservationTime = moment(observation.obsDt).format('MMM Do, H:mm a');
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
	const locationIDs = arrayPluck(locations, 'i');

	const data = [];
	Object.keys(sightings).forEach((locationID) => {
		const sightingData = sightings[locationID];

		if (!sightingData.fetched) {
			return;
		}
		if (locationIDs.indexOf(locationID) === -1) {
			return;
		}

		if (targetLocationID && locationID !== targetLocationID) {
			return;
		}

		for (let i = 0; i < obsRecency; i++) {
			let daySightings = sightingData.data[i].obs;
			for (let j = 0; j < daySightings.length; j++) {
				const info = daySightings[j];
				const time = moment(info.obsDt, 'YYYY-MM-DD HH:mm');

				let status;
				if (info.obsValid) {
					status = 'confirmed';
				} else if (info.obsReviewed) {
					status = 'reviewed';
				} else {
					status = 'not-reviewed';
				}

				data.push({
					comName: info.comName,
					sciName: info.sciName,
					howMany: info.howMany,
					lat: info.lat,
					lng: info.lng,
					subId: info.subId,
					locId: info.locId,
					locName: info.locName,
					reporter: `${info.firstName} ${info.lastName}`,
					obsDt: time,
					status: status,
					obsDtDisplay: time.format('MMM Do, H:mm a'),
					obsReviewed: info.obsReviewed,
					obsValid: info.obsValid
				});
			}
		}
	});

	return data;
};

const getNumNotableSightings = (locations, sightings, obsRecency) => {
	const locationIDs = arrayPluck(locations, 'i');

	let count = 0;
	Object.keys(sightings).forEach((locationID) => {
		const sightingData = sightings[locationID];

		if (!sightingData.fetched) {
			return;
		}
		if (locationIDs.indexOf(locationID) === -1) {
			return;
		}

		for (let i = 0; i < obsRecency; i++) {
			count += sightingData.data[i].obs.length;
		}
	});

	return count;
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
	var sortedLocations = [...locations];

	// apply the appropriate sort
	if (sort === C.LOCATION_SORT.FIELDS.LOCATION) {
		sortAlpha(sortedLocations, (locInfo) => locInfo.n);
	} else {
		// the 10000 thing is a bit weird, but basically we just need to sort the species count from largest to smallest
		// when the user first clicks the column. That does it.
		sortNumeric(sortedLocations, ({ i }) => {
			const sightings = locationSightings[i];
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

	locations.forEach((location) => {
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
	for (let i = 0; i < arr.length; i += chunkSize) {
		chunkedArray.push(arr.slice(i, i + chunkSize));
	}
	return chunkedArray;
};


const getColSort = (field, sort, sortDir) => {
	if (sort !== field) {
		return null;
	}

	var className = 'col-sort glyphicon ';
	className += (sortDir === C.SORT_DIR.DEFAULT) ? 'glyphicon-triangle-bottom' : 'glyphicon-triangle-top';

	return (
		<span className={className}/>
	);
};

const sortSightings = (sightings, sort, sortDir) => {
	let sorted = [];

	switch (sort) {
		case C.SIGHTINGS_SORT.FIELDS.NUM_LOCATIONS:
			if (sortDir === C.SORT_DIR.DEFAULT) {
				sorted = sortNumeric(sightings, (i) => i.locations.length);
			} else {
				sorted = sortNumeric(sightings, (i) => -i.locations.length);
			}
			break;

		case C.SIGHTINGS_SORT.FIELDS.LAST_SEEN:
			if (sortDir === C.SORT_DIR.DEFAULT) {
				sorted = sortNumeric(sightings, (i) => i.mostRecentObservation.format('X'));
			} else {
				sorted = sortNumeric(sightings, (i) => -i.mostRecentObservation.format('X'));
			}
			break;

		case C.NOTABLE_SIGHTINGS_SORT.FIELDS.NUM_REPORTED:
		case C.SIGHTINGS_SORT.FIELDS.NUM_REPORTED:
			if (sortDir === C.SORT_DIR.DEFAULT) {
				sorted = sortNumeric(sightings, (i) => i.howManyCount);
			} else {
				sorted = sortNumeric(sightings, (i) => -i.howManyCount);
			}
			break;

		case C.NOTABLE_SIGHTINGS_SORT.FIELDS.LOCATION:
			if (sortDir === C.SORT_DIR.DEFAULT) {
				sorted = sortAlpha(sightings, (i) => i.locName);
			} else {
				sorted = sortAlpha(sightings, (i) => i.locName, 'DESC');
			}
			break;

		case C.NOTABLE_SIGHTINGS_SORT.FIELDS.DATE_SEEN:
			if (sortDir === C.SORT_DIR.DEFAULT) {
				sorted = sortNumeric(sightings, (i) => i.obsDt.format('X'));
			} else {
				sorted = sortNumeric(sightings, (i) => -i.obsDt.format('X'));
			}
			break;

		case C.NOTABLE_SIGHTINGS_SORT.FIELDS.REPORTER:
			if (sortDir === C.SORT_DIR.DEFAULT) {
				sorted = sortAlpha(sightings, (i) => i.reporter);
			} else {
				sorted = sortAlpha(sightings, (i) => i.reporter, 'DESC');
			}
			break;

		case C.NOTABLE_SIGHTINGS_SORT.FIELDS.STATUS:
			if (sortDir === C.SORT_DIR.DEFAULT) {
				sorted = sortAlpha(sightings, (i) => i.status);
			} else {
				sorted = sortAlpha(sightings, (i) => i.status, 'DESC');
			}
			break;

		// species name
		default:
			if (sortDir === C.SORT_DIR.DEFAULT) {
				sorted = sortAlpha(sightings, (i) => i.comName.toLowerCase());
			} else {
				sorted = sortAlpha(sightings, (i) => i.comName.toLowerCase(), 'DESC');
			}
			break;
	}

	return sorted;
};


const rad = (x) => {
	return x * Math.PI / 180;
};


const findClosestLatLng = (sourceLat, sourceLng, list) => {
	const R = 6371; // radius of earth in km

	var distances = [];
	var closest = null;

	for (let i = 0; i < list.length; i++) {
		let lat = list[i][0];
		let lng = list[i][1];

		var deltaLat = rad(lat - sourceLat);
		var deltaLng = rad(lng - sourceLng);
		var a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(rad(lat)) *
		Math.cos(rad(lat)) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c;

		distances[i] = d;

		if (closest === null || d < distances[closest]) {
			closest = i;
		}
	}
	return {
		lat: list[closest][0],
		lng: list[closest][1]
	};
};


const getAllLocationsCount = (searchType, observationRecency, locations, locationSightings) => {
	let count = 0;
	if (searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.ALL) {
		var results = getUniqueSpeciesInLocationList(locations, locationSightings, observationRecency);
		count = results.count;
	} else {
		count = getNumNotableSightings(locations, locationSightings, observationRecency);
	}
	return count;
};


const isNumeric = (n) => {
	return !isNaN(parseFloat(n)) && isFinite(n);
};


const arrayPluck = (arr, prop) => {
	return arr.map((item) => item[prop]);
};


/**
 * Very basic generic sorter function for numeric values. The benefit of this method is that you can just
 * pass a function that returns the number value out of a complex object, rather than have to supply the comparison
 * operators, e.g.
 *      helpers.sortNumeric(data, (obj) => obj.totalCount);
 *      helpers.sortNumeric(data, (obj) => -obj.totalCount); // reverse sort
 * @param arr
 * @param extractFn
 * @return {*}
 */
const sortNumeric = (arr, extractFn) => {
	arr.sort((a, b) => {
		if (extractFn(a) > extractFn(b)) {
			return 1;
		} else if (extractFn(a) < extractFn(b)) {
			return -1
		}
		return 0;
	});

	return arr;
};

/**
 * Sorts an array of objects (in place, but also returns) by an arbitrary property value, determined by the fn() function
 * which returns the value. The second
 * @param arr
 * @param extractFn
 * @param dir
 * @return {*}
 */
const sortAlpha = (arr, extractFn, dir = 'ASC') => {
	arr.sort((a, b) => {
		return dir === 'DESC' ?
			- extractFn(a).localeCompare(extractFn(b)) :
			(extractFn(a).localeCompare(extractFn(b)));
	});
	return arr;
};


const times = (count, fn) => {
	return Array.from({ length: 10 }, (_,x) => fn(x));
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
	getNumNotableSightings,
	highlightString,
	sortLocations,
	getNumLoadedLocations,
	queryParams,
	getPacketSize,
	chunkArray,
	getColSort,
	sortSightings,
	rad,
	findClosestLatLng,
	getAllLocationsCount,
	isNumeric,
	arrayPluck,
	sortNumeric,
	sortAlpha,
	times
};
