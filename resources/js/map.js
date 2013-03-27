/*jslint browser:true*/
/*global $:false,google:false,console:false,manager:false*/
define([
	"jquery"
], function($) {
	'use strict';

console.log(manager);

	var _defaultMapOptions = {
		center: new google.maps.LatLng(20, 12),
		zoom: 2,
		mapTypeId: google.maps.MapTypeId.TERRAIN,
		mapTypeControlOptions: { mapTypeIds: [] },
		streetViewControl: false
	};
	var _mapCanvas = null;
	var _el = null;
	var _currPlace = null;
	var _icon = 'resources/images/marker.png';
	var _geocoder = null;
	var _markers = {};
	var _infoWindows = {};
	var _lastAddressSearchValid = null;
	var _zoomBoundsChangeEnabled = false;


	/**
	 * Called by search's init function.
	 */
	var _init = function() {
		_mapCanvas = $('#mapTabContent')[0];
		_el        = new google.maps.Map(_mapCanvas, _defaultMapOptions);
		_geocoder  = new google.maps.Geocoder();

		_addCustomControls();
		_autocomplete = new google.maps.places.Autocomplete(manager.searchField);
		_autocomplete.bindTo('bounds', _el);

		// executed whenever the user selects a place through the auto-complete function
		google.maps.event.addListener(_autocomplete, 'place_changed', _onAutoComplete);

		// called any time the map has had it's bounds changed
		google.maps.event.addListener(_el, 'dragend', _onMapBoundsChange);
	};

	var _enableDetectZoomBoundsChange = function() {
		if (!_zoomBoundsChangeEnabled) {
			google.maps.event.addListener(_el, 'zoom_changed', _onMapBoundsChange);
			_zoomBoundsChangeEnabled = true;
		}
	};

	var _onAutoComplete = function() {
		// assume the worst. When the user submits the search form, we'll check it was valid or not
		_lastAddressSearchValid = false;
		_currPlace = _autocomplete.getPlace();
	};

	var _onMapBoundsChange = function() {
		if (manager.activeHotspotRequest || !_lastAddressSearchValid) {
			return;
		}

		manager.visibleHotspots = _addMarkers({ searchType: manager.searchType, clearMarkers: false });
		manager.numVisibleHotspots = manager.visibleHotspots.length;
		manager.displayHotspots();
		manager.getAllHotspotObservations();
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

		if ($.isEmptyObject(manager.allHotspots)) {
			manager.stopLoading();
			return [];
		}

		var hotspotSearchTypeKey = (searchType === 'all') ? 'fromAllObservationSearch' : 'fromNotableObservationSearch';
		var mapBoundary = _el.getBounds();
		var boundsObj = new google.maps.LatLngBounds(mapBoundary.getSouthWest(), mapBoundary.getNorthEast());
		var visibleHotspots = [];
		var counter = 1;
		manager.maxHotspotsReached = false;

		for (var locationID in manager.allHotspots) {
			if (counter > manager.MAX_HOTSPOTS) {
				manager.maxHotspotsReached = true;
				continue;
			}

			var currHotspot = manager.allHotspots[locationID];
			var latlng = new google.maps.LatLng(currHotspot.lt, currHotspot.lg);
			if (!boundsObj.contains(latlng)) {
				continue;
			}

			// check data has been loaded for this particular search (all / notable)
			if (!manager.allHotspots[locationID][hotspotSearchTypeKey]) {
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
		var numSpecies = manager.allHotspots[locationID].observations[manager.searchType][manager.observationRecency + 'day'].numSpeciesRunningTotal;
		var html = '<div class="hotspotDialog"><p><b>' + manager.allHotspots[locationID].n + '</b></p>' +
			'<p><a href="#" class="viewLocationBirds" data-location="' + locationID + '">View bird species spotted at this location <b>(' +
			numSpecies + ')</b></a></p></div>';

		return html;
	};

	var _addCustomControls = function() {
		var btn1 = $('<div class="mapBtn mapBtnSelected">Terrain</div>')[0];
		var btn2 = $('<div class="mapBtn">Road Map</div>')[0];
		var btn3 = $('<div class="mapBtn">Satellite</div>')[0];
		var btn4 = $('<div class="mapBtn">Hybrid</div>')[0];

		// add the controls to the map
		_el.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn4);
		_el.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn3);
		_el.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn2);
		_el.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn1);

		// add the appropriate event handlers
		google.maps.event.addDomListener(btn1, 'click', function() {
			_el.setMapTypeId(google.maps.MapTypeId.TERRAIN);
			$(".mapBtn").removeClass('mapBtnSelected');
			$(btn1).addClass('mapBtnSelected');
		});
		google.maps.event.addDomListener(btn2, 'click', function() {
			_el.setMapTypeId(google.maps.MapTypeId.ROADMAP);
			$(".mapBtn").removeClass('mapBtnSelected');
			$(btn2).addClass('mapBtnSelected');
		});
		google.maps.event.addDomListener(btn3, 'click', function() {
			_el.setMapTypeId(google.maps.MapTypeId.SATELLITE);
			$(".mapBtn").removeClass('mapBtnSelected');
			$(btn3).addClass('mapBtnSelected');
		});
		google.maps.event.addDomListener(btn4, 'click', function() {
			_el.setMapTypeId(google.maps.MapTypeId.HYBRID);
			$(".mapBtn").removeClass('mapBtnSelected');
			$(btn4).addClass('mapBtnSelected');
		});
	};

	return {
		init: _init,
		addMarkers: _addMarkers,
		enableDetectZoomBoundsChange: _enableDetectZoomBoundsChange
	};
});