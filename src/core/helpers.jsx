import React from 'react';
import { C, _ } from './';
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
	const locationObj = (viewport) ? viewport : bounds;
  const topRight = locationObj.getNorthEast();
  const bottomLeft = locationObj.getSouthWest();

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

	const species = {};
	let numSpecies = 0;
	_.times(obsRecency, function (index) {
		if (!sightings[locationID].fetched) {
			return;
		}
		let observations = sightings[locationID].data[index].obs;
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
	let locationIDs = getLocationIDs(locations);
	let dataBySpecies = {};
  let allDataBySpecies = {}; // needed to figure out how many locations each species is at

  // gah! Super complicated.
	_.each(locationIDs, (locationID) => {
		let currLocationSpeciesInfo = getLocationSpeciesList(locationID, sightings, obsRecency);

    // only include the species info if the users's looking as "All Locations", or if this current location
    // is the specific one
    _.each(currLocationSpeciesInfo.species, function (info, sciName) {
      if (targetLocationID === null || locationID === targetLocationID) {
        if (!_.has(dataBySpecies, sciName)) {
          dataBySpecies[sciName] = {
            comName: info.comName,
            sciName: sciName,
            obs: [],
            locations: [],
            mostRecentObservationTime: null,
            howManyCount: 0
          };
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
      }

      // allDataBySpecies is a temp var in this method used to contain ALL observation details for each species,
      // regardless of whether the user is viewing a specific location. This is used to show the full list of locations
      // where a species has been seen
      if (!_.has(allDataBySpecies, sciName)) {
        allDataBySpecies[sciName] = [];
      }
      allDataBySpecies[sciName].push({ locID: info.locID, locName: info.locName, subID: info.subID });
		});
	});

  // now append ALL locations for the found species. TODO this only needs to change when the search does. It shouldn't be here.
  _.each(dataBySpecies, (speciesData, sciName) => {
    const uniqueLocations = [];

    _.each(allDataBySpecies[sciName], (obsInfo) => {
      if (uniqueLocations.indexOf(obsInfo.locID) === -1) {
        uniqueLocations.push(obsInfo.locID);
        dataBySpecies[sciName].locations.push(obsInfo);
      }
    });
  });

  // now convert the sightings into an array
	let sightingsData = _.values(dataBySpecies);
	sightingsData.sort(function(a, b) { return (a.comName.toLowerCase() > b.comName.toLowerCase()) ? 1 : -1; });

	let results = _.map(sightingsData, function (sighting) {
		let lastObservation = 0;
		let howManyArray = [];
		let lastSeenArray = [];

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

    if (targetLocationID && locationID !== targetLocationID) {
      return;
    }

		for (let i=0; i<obsRecency; i++) {
			let daySightings = sightingData.data[i].obs;
			for (let j=0; j<daySightings.length; j++) {
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
          subID: info.subID,
					locID: info.locID,
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
  const locationIDs = _.pluck(locations, 'i');

  let count = 0;
  _.each(sightings, (sightingData, locationID) => {
    if (!sightingData.fetched) {
      return;
    }
    if (locationIDs.indexOf(locationID) === -1) {
      return;
    }

    for (let i=0; i<obsRecency; i++) {
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


const getColSort = (field, sort, sortDir) => {
	if (sort !== field) {
		return null;
	}

	var className = 'col-sort glyphicon ';
	className += (sortDir === C.SORT_DIR.DEFAULT) ? 'glyphicon-triangle-bottom' : 'glyphicon-triangle-top';

	return (
		<span className={className} />
	);
};

const sortSightings = (sightings, sort, sortDir) => {
  let sorted = [];

  switch (sort) {
    case C.SIGHTINGS_SORT.FIELDS.NUM_LOCATIONS:
      if (sortDir === C.SORT_DIR.DEFAULT) {
        sorted = _.sortBy(sightings, function (i) { return i.locations.length; });
      } else {
        sorted = _.sortBy(sightings, function (i) { return -i.locations.length; });
      }
      break;

    case C.SIGHTINGS_SORT.FIELDS.LAST_SEEN:
      if (sortDir === C.SORT_DIR.DEFAULT) {
        sorted = _.sortBy(sightings, function (i) { return i.mostRecentObservation.format('X'); });
      } else {
        sorted = _.sortBy(sightings, function (i) { return -i.mostRecentObservation.format('X'); });
      }
      break;

    case C.NOTABLE_SIGHTINGS_SORT.FIELDS.NUM_REPORTED:
    case C.SIGHTINGS_SORT.FIELDS.NUM_REPORTED:
      if (sortDir === C.SORT_DIR.DEFAULT) {
        sorted = _.sortBy(sightings, function (i) { return i.howManyCount; });
      } else {
        sorted = _.sortBy(sightings, function (i) { return -i.howManyCount; });
      }
      break;

    case C.NOTABLE_SIGHTINGS_SORT.FIELDS.LOCATION:
      if (sortDir === C.SORT_DIR.DEFAULT) {
        sorted = _.sortBy(sightings, (i) => i.locName.toLowerCase());
      } else {
        sorted = _.sortBy(sightings, (i) => i.locName.toLowerCase().charCodeAt() * -1);
      }
      break;

    case C.NOTABLE_SIGHTINGS_SORT.FIELDS.DATE_SEEN:
      if (sortDir === C.SORT_DIR.DEFAULT) {
        sorted = _.sortBy(sightings, function (i) { return i.obsDt.format('X'); });
      } else {
        sorted = _.sortBy(sightings, function (i) { return -i.obsDt.format('X'); });
      }
      break;

    case C.NOTABLE_SIGHTINGS_SORT.FIELDS.REPORTER:
      if (sortDir === C.SORT_DIR.DEFAULT) {
        sorted = _.sortBy(sightings, (i) => i.reporter.toLowerCase());
      } else {
        sorted = _.sortBy(sightings, (i) => i.reporter.toLowerCase().charCodeAt() * -1);
      }
      break;

    case C.NOTABLE_SIGHTINGS_SORT.FIELDS.STATUS:
      if (sortDir === C.SORT_DIR.DEFAULT) {
        sorted = _.sortBy(sightings, (i) => i.status);
      } else {
        sorted = _.sortBy(sightings, (i) => i.status.charCodeAt() * -1);
      }
      break;

    // species name
    default:
      if (sortDir === C.SORT_DIR.DEFAULT) {
        sorted = _.sortBy(sightings, (i) => i.comName.toLowerCase() );
      } else {
        sorted = _.sortBy(sightings, (i) => i.comName.toLowerCase().charCodeAt() * -1);
      }
      break;
  }

  return sorted;
};


const rad = (x) => {
  return x * Math.PI/180;
};


const findClosestLatLng = (sourceLat, sourceLng, list) => {
  const R = 6371; // radius of earth in km

  var distances = [];
  var closest = null;

  for (let i=0; i<list.length; i++) {
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
	getAllLocationsCount
};
