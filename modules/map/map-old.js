/*jslint browser:true*/
/*global $:false,google:false,console:false,manager:false*/
define([
	"jquery"
], function($) {
	'use strict';

	var _manager = null;
	var _mapCanvas = null;
	var _el = null;
	var _currPlace = null;
	var _icon = 'resources/images/marker.png';
	var _geocoder = null;
	var _markers = {};
	var _infoWindows = {};
	var _lastAddressSearchValid = null;
	var _zoomBoundsChangeEnabled = false;
	var _autocomplete = null;

	// manager helper functions
	var _hasActiveHotspotRequest = null;


	/**
	 * Called by search's init function.
	 */
	var _init = function(params) {
		var searchField          = params.searchField;
		_hasActiveHotspotRequest = params.hasActiveHotspotRequest;

		_mapCanvas = $('#mapTabContent')[0];
		_el        = new google.maps.Map(_mapCanvas, _defaultMapOptions);
		_geocoder  = new google.maps.Geocoder();

		_addCustomControls();
		_autocomplete = new google.maps.places.Autocomplete(searchField);
		_autocomplete.bindTo('bounds', _el);

		// executed whenever the user selects a place through the auto-complete function
		google.maps.event.addListener(_autocomplete, 'place_changed', _onAutoComplete);

		// called any time the map has had its bounds changed
		google.maps.event.addListener(_el, 'dragend', _onMapBoundsChange);
	};

	var _enableDetectZoomBoundsChange = function() {
		if (!_zoomBoundsChangeEnabled) {
			google.maps.event.addListener(_el, 'zoom_changed', _onMapBoundsChange);
			_zoomBoundsChangeEnabled = true;
		}
	};


	var _onMapBoundsChange = function() {
		if (_hasActiveHotspotRequest() || !_lastAddressSearchValid) {
			return;
		}

		var visibilHotspots = _addMarkers({
			searchType: _manager.getSearchType(),
			clearMarkers: false
		});
		_manager.onMapBoundaryUpdate(visibleHotspots);
	};

	// clears the map. Note that we DON'T reset _markers. That retains the information loaded for as long as the user's
	// session so we don't re-request the same info from eBird
	var _clear = function() {
		for (var locationID in _markers) {
			_markers[locationID].setMap(null);
		}
	};

	/**
	 * Called after the hotspot locations from an "all" or "notable" search. The hotspot data is thus
	 * available, but not necessarily the observations. It intelligently adds the markers, depending on
	 * whether the location's lat/lng is within the viewport. Note: it only actually CREATES the marker once, 
	 * adding it to _markers. Future searches / updates that don't need the marker just hide it.
	 */
	var _addMarkers = function(settings) {
		var searchType   = settings.searchType;
		var clearMarkers = settings.clearMarkers;

		if (clearMarkers) {
			_clear();
		}

		if ($.isEmptyObject(_manager.allHotspots)) {
			_manager.stopLoading();
			return [];
		}

		var hotspotSearchTypeKey = (searchType === 'all') ? 'fromAllObservationSearch' : 'fromNotableObservationSearch';
		var mapBoundary = _el.getBounds();
		var boundsObj = new google.maps.LatLngBounds(mapBoundary.getSouthWest(), mapBoundary.getNorthEast());
		var visibleHotspots = [];
		var counter = 1;
		_manager.maxHotspotsReached = false;

		for (var locationID in _manager.allHotspots) {
			if (counter > _manager.MAX_HOTSPOTS) {
				_manager.maxHotspotsReached = true;
				continue;
			}

			var currHotspot = _manager.allHotspots[locationID];
			var latlng = new google.maps.LatLng(currHotspot.lt, currHotspot.lg);
			if (!boundsObj.contains(latlng)) {
				continue;
			}

			// check data has been loaded for this particular search (all / notable)
			if (!_manager.allHotspots[locationID][hotspotSearchTypeKey]) {
				continue;
			}

			if (_markers.hasOwnProperty(locationID)) {
				if (_markers[locationID].map === null) {
					_markers[locationID].setMap(_el);
				}
			} else {
				_markers[locationID] = new google.maps.Marker({
					position: latlng,
					map: _el,
					title: currHotspot.n,
					icon: _icon,
					locationID: locationID
				});
				_infoWindows[locationID] = new google.maps.InfoWindow();

				(function(marker, infowindow, locationID) {
					google.maps.event.addListener(marker, 'click', function() {
						infowindow.setContent(_getInfoWindowHTML(locationID));
						infowindow.open(_el, this);
					});
				})(_markers[currHotspot.i], _infoWindows[currHotspot.i], currHotspot.i);
			}

			visibleHotspots.push(locationID);
			counter++;
		}

		return visibleHotspots;
	};

	var _getInfoWindowHTML = function(locationID) {
		var numSpecies = _manager.allHotspots[locationID].observations[_manager.searchType][_manager.observationRecency + 'day'].numSpeciesRunningTotal;
		var html = '<div class="hotspotDialog"><p><b>' + manager.allHotspots[locationID].n + '</b></p>' +
			'<p><a href="#" class="viewLocationBirds" data-location="' + locationID + '">View bird species spotted at this location <b>(' +
			numSpecies + ')</b></a></p></div>';

		return html;
	};


	return {
		init: _init,
		addMarkers: _addMarkers,
		enableDetectZoomBoundsChange: _enableDetectZoomBoundsChange
	};
});