import React from 'react';
import ReactDOM from 'react-dom';
import { C, E, helpers, _ } from './core';
//import fetch from 'isomorphic-fetch';


function setLocale (locale) {
  return {
    type: E.SET_LOCALE,
    locale
  };
}

function setSearchLocation (location) {
  return {
    type: E.SET_SEARCH_LOCATION,
    location
  };
}

function startSearchRequest (searchSettings, locationInfo) {
  return {
    type: E.SEARCH_REQUEST_STARTED,
    lat: locationInfo.lat,
    lng: locationInfo.lng,
    location: locationInfo.location,
    bounds: locationInfo.bounds
  };
}

function searchRequestComplete () {
  return { type: E.SEARCH_REQUEST_ENDED };
}

function search (searchSettings, locationInfo) {
  return function (dispatch) {
    dispatch(startSearchRequest(searchSettings, locationInfo));

    var searchParams = {
      lat: locationInfo.lat,
      lng: locationInfo.lng,
      limitByObservationRecency: searchSettings.limitByObservationRecency,
      observationRecency: searchSettings.observationRecency
    };

    // holy good lord. This monstrosity makes a request for the hotspots, converts the results to JSON (which is async
    // for some reason...?) then publishes the appropriate action
    return fetchBirdSightings(searchParams)
      .then(res => res.json())
      .then(
        json  => dispatch(searchLocationsFound(dispatch, json),
        error => dispatch(searchLocationRequestError(dispatch, error))
      )
    );
  }
}

function searchLocationsFound (dispatch, locations) {
  dispatch(searchRequestComplete());
  return {
    type: E.SEARCH_LOCATIONS_RETURNED,
    success: true,
    locations
  };
}

function searchLocationRequestError (dispatch, error) {
  dispatch(searchRequestComplete());
  return {
    type: E.SEARCH_LOCATIONS_RETURNED,
    success: false,
    error: error
  };
}

function fetchBirdSightings (searchParams) {
  var formData = new FormData();
  _.each(searchParams, function (val, key) {
    formData.append(key, val);
  });

  return fetch('/birdsearch.org/ajax/getHotspotLocations.php', {
    method: 'POST',
    body: formData
  });
}

function setIntroOverlayVisibility (visible) {
  return {
    type: E.SET_INTRO_OVERLAY_VISIBILITY,
    visible
  };
}

function requestingUserLocation () {
  return { type: E.REQUESTING_USER_LOCATION };
}

function requestGeoLocation (searchInfo) {
  return function (dispatch) {
    navigator.geolocation.getCurrentPosition(function (position) {
      convertLatLngToAddress(dispatch, searchInfo, position.coords.latitude, position.coords.longitude);
    });
  };
}

function convertLatLngToAddress (dispatch, searchInfo, lat, lng) {
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ latLng: { lat: lat, lng: lng }}, function (results, status) {
    var reverseGeocodeSuccess = false;
    var address = '';
    var bounds = null;
    if (status === google.maps.GeocoderStatus.OK) {
      if (results[1]) {
        reverseGeocodeSuccess = true;
        address = results[1].formatted_address;
        bounds = helpers.getBestBounds(results[1].geometry.viewport, results[1].geometry.bounds);
      }
    }

    dispatch({
      type: E.RECEIVED_USER_LOCATION,
      reverseGeocodeSuccess: reverseGeocodeSuccess,
      lat: lat,
      lng: lng,
      address: address,
      bounds: bounds
    });

    // Urgh! at this point I want to fire off an actual search request. But in order to do that, I need all the search
    // settings info. So we either:
    // - pass that info down the chain of method calls to here, or
    // - somehow listen to the RECEIVED_USER_LOCATION event (in a reducer, I guess), change something in the store which
    // a component would listen to, then in its componentDidUpdate() method call the search? Jesus. This is awful.


//lat: 49.376765299999995
//lng: -123.37015410000001
//location: "Bowen Island, BC, Canada"
//observationRecency: 30
//searchType: "all"


  });
}


function getGeoLocation (searchInfo) {
  return function (dispatch) {
    dispatch(requestingUserLocation());

    // TODO if the browser doesn't support geolocation, make a note of it
    //if (!navigator.geolocation) {
    //}

    return dispatch(requestGeoLocation(searchInfo));
  }
}

function togglePanelVisibility (panel) {
  return {
    type: E.TOGGLE_PANEL_VISIBILITY,
    panel: panel
  };
}

function updateVisibleLocations (locations) {
  return {
    type: E.VISIBLE_LOCATIONS_UPDATED,
    locations: locations
  };
}


/*
var _getBirdHotspotObservations = function() {
  var hasAtLeastOneRequest = false;
  for (var i=0; i<_numVisibleLocations; i++) {
    var currLocationID = _visibleLocations[i].locationID;

    // check allHotspots to see if this data has been loaded yet. If not, prep the object. To reduce
    // server requests, we intelligently categorize all sightings into an array, where the index-1 === the day.
    // That way, if the user does a search for 30 days then reduces the recency setting, we don't need any
    // superfluous requests. If a request for 30 days goes through, ALL properties have their available property
    // set to true
    if (!_birdSearchHotspots[currLocationID].hasOwnProperty("sightings")) {
      _birdSearchHotspots[currLocationID].isDisplayed = false;
      _birdSearchHotspots[currLocationID].sightings = {
        success: null,
        data: $.extend(true, [], _sightingsArray)
      };
    }

    // if we already have the hotspot data available, just update the sidebar table
    if (_birdSearchHotspots[currLocationID].sightings.data[_lastSearchObsRecency-1].available) {
      _updateVisibleLocationInfo(currLocationID, _birdSearchHotspots[currLocationID].sightings.data[_lastSearchObsRecency-1].numSpeciesRunningTotal);
    } else {
      _getSingleHotspotObservations(currLocationID);
      hasAtLeastOneRequest = true;
    }
  }

  // if we didn't just put through a new request, the user just searched a subset of what's already been loaded
  if (!hasAtLeastOneRequest) {
    _sortTable("#sidebarResultsTable");
    helper.stopLoading();

    var locations = _getVisibleLocationData();
    mediator.publish(_MODULE_ID, C.EVENT.BIRD_SIGHTINGS_LOADED, {
      birdData: locations,
      observationRecency: _lastSearchObsRecency
    });
  }
};


var _getSingleHotspotObservations = function(locationID) {
  $.ajax({
    url: "ajax/getHotspotSightings.php",
    data: {
      locationID: locationID,
      recency: _lastSearchObsRecency
    },
    type: "POST",
    dataType: "json",
    success: function(response) {
      _onSuccessReturnLocationObservations(locationID, response);
    },
    error: function(response) {
      _onErrorReturnLocationObservations(locationID, response);
    }
  });
};


 * Returns the observations reports for a single location at a given interval (last 2 days, last 30 days
 * etc). This can be called multiple times for a single location if the user keeps increasing the recency
 * range upwards.
 * @param locationID
 * @param response
 * @private

var _onSuccessReturnLocationObservations = function(locationID, response) {
  _birdSearchHotspots[locationID].isDisplayed = true;
  _birdSearchHotspots[locationID].sightings.success = true;

  // by reference, of course
  var sightingsData = _birdSearchHotspots[locationID].sightings.data;

  // mark the information as now available for this observation recency + and anything below,
  // and reset the observation data (it's about to be updated below)
  for (var i=0; i<C.SETTINGS.NUM_SEARCH_DAYS; i++) {
    if (i <= _lastSearchObsRecency) {
      sightingsData[i] = { available: true, obs: [], numSpecies: 0, numSpeciesRunningTotal: 0 };
    } else {
      sightingsData[i] = { available: false, obs: [], numSpecies: 0, numSpeciesRunningTotal: 0 };
    }
  }

  // now for the exciting part: loop through the observations and put them in the appropriate spot
  // in the data structure
  var speciesCount = response.length;
  for (var i=0; i<speciesCount; i++) {
    var observationTime = parseInt(moment(response[i].obsDt, "YYYY-MM-DD HH:mm").format("X"), 10);
    var difference = _CURRENT_SERVER_TIME - observationTime;
    var daysAgo = Math.ceil(difference / _ONE_DAY_IN_SECONDS); // between 1 and 30

    // sometimes users seem to be able to input future-dated observations (presumably by screwing up AM + PM)
    // so daysAgo can, actually be zero. This prevents that edge case
    var daysAgo = (daysAgo < 1) ? 1 : daysAgo;
    sightingsData[daysAgo-1].obs.push(response[i]);
  }

  // we've added all the observation data, set the numSpecies counts
  for (var i=0; i<sightingsData.length; i++) {
    sightingsData[i].numSpecies = sightingsData[i].obs.length;
  }

  // now set the numSpeciesRunningTotal property. This is the running total seen in that time
  // range: e.g. 3 days would include the total species seen on days 1-3, 4 days would have 1-4 etc.
  var uniqueSpecies = {};
  var numUniqueSpecies = 0;
  for (var i=0; i<C.SETTINGS.NUM_SEARCH_DAYS; i++) {
    var currDaySightings = _birdSearchHotspots[locationID].sightings.data[i];
    for (var j=0; j<currDaySightings.obs.length; j++) {
      if (!uniqueSpecies.hasOwnProperty(currDaySightings.obs[j].sciName)) {
        uniqueSpecies[currDaySightings.obs[j].sciName] = null;
        numUniqueSpecies++;
      }
    }
    _birdSearchHotspots[locationID].sightings.data[i].numSpeciesRunningTotal = numUniqueSpecies;
  }

  _updateVisibleLocationInfo(locationID, response.length);

  if (_checkAllObservationsLoaded()) {
    _sortTable("#sidebarResultsTable");
    helper.stopLoading();

    // get the subset of locations currently on the map
    var locations = _getVisibleLocationData();

    mediator.publish(_MODULE_ID, C.EVENT.BIRD_SIGHTINGS_LOADED, {
      birdData: locations, // _birdSearchHotspots,
      observationRecency: _lastSearchObsRecency
    });
  }
};
*/

export {
  setLocale,
  setSearchLocation,
  search,
  setIntroOverlayVisibility,
  getGeoLocation,
  togglePanelVisibility,
  updateVisibleLocations
};
