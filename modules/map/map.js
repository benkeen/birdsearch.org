define([
	"mediator",
	"constants",
	"moduleHelper",
	"dataCache",
	"text!notableSightingsInfoWindowTemplate"
], function(mediator, C, helper, dataCache, notableSightingsInfoWindowTemplate) {
	"use strict";

	var _MODULE_ID = "map";
	var _mapCanvas;
	var _map;
	var _icon = "images/marker.png";
	var _visibleHotspots = [];
	var _defaultMapOptions = {
		zoom: 4,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControlOptions: { mapTypeIds: [] },
		center: new google.maps.LatLng(40, -95),
		streetViewControl: false,
		disableDefaultUI: true,
		panControl: true,
		zoomControl: true,
		scaleControl: true,
		overviewMapControl: true
	};
	var _currTab = "mapTab";

	// general fields relating to search
	var _currSearchType = null;
	var _searchStarted = false;
	var _circleOverlayIndex = 0;
	var _circleOverlays = [];
	var _searchTypeCircleRadius = {
		all: 60000,
		notable: 250000,
		hotspots: 60000
	};
	var _lastSearchLatLng = null;
	var _lastSearchObservationRecency = null;

	// all bird sightings search

	// notable search
	var _lastSearchNotableSightings = [];
	var _notableMarkers = {};
	var _notableInfoWindows = {};
	var _openNotableInfoWindows = [];

	// hotspot search
	var _lastSearchAllHotspots = [];
	var _hotspotInfoWindows = {};
	var _hotspotMarkers = {};
	var _openHotspotInfoWindows = [];

	// this sucks. Group all the above data here, maybe...
	var _searchTypeData = {
		all: null,
		notable: {
			infoWindows: _notableInfoWindows,
			openInfoWindows: _openNotableInfoWindows,
			markers: _notableMarkers
		},
		hotspots: {
			infoWindows: _hotspotInfoWindows,
			openInfoWindows: _openHotspotInfoWindows,
			markers: _hotspotMarkers
		}
	};


	var _init = function() {
		var subscriptions = {};
		subscriptions[C.EVENT.WINDOW_RESIZE] = _resizeMap;
		subscriptions[C.EVENT.TAB_CHANGED] = _onTabChanged;
		subscriptions[C.EVENT.SEARCH] = _onSearch;
		subscriptions[C.EVENT.LOCATION_MOUSEOVER] = _onLocationMouseover;
		subscriptions[C.EVENT.LOCATION_MOUSEOUT] = _onLocationMouseout;
		subscriptions[C.EVENT.LOCATION_CLICK] = _onLocationClick;
		mediator.subscribe(_MODULE_ID, subscriptions);
	};

	/**
	 * Called manually by mainPanel.js after the panel has been created. Could this be
	 * part of init()? Would sure be nice...
	 */
	var _create = function() {
		google.maps.visualRefresh = true;

		_mapCanvas = $('#mapTabContent')[0];
		_map       = new google.maps.Map(_mapCanvas, _defaultMapOptions);
		_addCustomControls();
		_addEventHandlers();

		// called any time the map has had its bounds changed
		google.maps.event.addListener(_map, "dragend", _onMapBoundsChange);
		google.maps.event.addListener(_map, "zoom_changed", _onMapBoundsChange);

		mediator.publish(_MODULE_ID, C.EVENT.TRIGGER_WINDOW_RESIZE);
	};

	var _addCustomControls = function() {
		var btn1 = $('<div class="mapBtn">Terrain</div>')[0];
		var btn2 = $('<div class="mapBtn mapBtnSelected">Road Map</div>')[0];
		var btn3 = $('<div class="mapBtn">Satellite</div>')[0];
		var btn4 = $('<div class="mapBtn">Hybrid</div>')[0];

		// add the controls to the map
		_map.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn4);
		_map.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn3);
		_map.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn2);
		_map.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn1);

		// add the appropriate event handlers
		google.maps.event.addDomListener(btn1, 'click', function() {
			_map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
			$(".mapBtn").removeClass('mapBtnSelected');
			$(btn1).addClass('mapBtnSelected');
		});
		google.maps.event.addDomListener(btn2, 'click', function() {
			_map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
			$(".mapBtn").removeClass('mapBtnSelected');
			$(btn2).addClass('mapBtnSelected');
		});
		google.maps.event.addDomListener(btn3, 'click', function() {
			_map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
			$(".mapBtn").removeClass('mapBtnSelected');
			$(btn3).addClass('mapBtnSelected');
		});
		google.maps.event.addDomListener(btn4, 'click', function() {
			_map.setMapTypeId(google.maps.MapTypeId.HYBRID);
			$(".mapBtn").removeClass('mapBtnSelected');
			$(btn4).addClass('mapBtnSelected');
		});
	};

	var _addEventHandlers = function() {
		$(document).on("click", ".viewNotableSightingDetails", _onClickViewFullNotableDetails);
	};

	var _onClickViewFullNotableDetails = function(e) {
		e.preventDefault();
		var locationID = $(e.target).data("locationId");

		mediator.publish(_MODULE_ID, C.EVENT.MAP.VIEW_NOTABLE_SIGHTING_SINGLE_LOCATION, {
			locationID: locationID
//			lastSearchNotableSightings: _lastSearchNotableSightings,
//			lastSearchObservationRecency: _lastSearchObservationRecency
		});
	};

	var _onMapBoundsChange = function() {

		// if there's an ongoing search, don't do anything
		if (_searchStarted) {
			return;
		}

		// cool. This can be used to detect when it's 25KM away from the original search, then do a fresh search
		//console.log("distance from center:", _calcDistance(_lastSearchLatLng, _map.getCenter()));

		_clearHotspots();

		// this adds as many as possible to the map - but many may be out of bounds
		switch (_currSearchType) {
			case "notable":
				_addHotspotMarkers("notable", _lastSearchNotableSightings);
				mediator.publish(_MODULE_ID, C.EVENT.MAP.NOTABLE_MARKERS_ADDED, {
					locations: _visibleHotspots,
					lastSearchObservationRecency: _lastSearchObservationRecency
				});
				break;

			case "hotspots":
				_addHotspotMarkers("hotspots", _lastSearchAllHotspots);
				mediator.publish(_MODULE_ID, C.EVENT.MAP.HOTSPOT_MARKERS_ADDED, {
					hotspots: _visibleHotspots
				});
				break;
		}
	};

	var _onSearch = function(msg) {

		// make a note of the search type
		_currSearchType = msg.data.resultType;

		var lat = msg.data.locationObj.lat();
		var lng = msg.data.locationObj.lng();

		_lastSearchLatLng = msg.data.locationObj;

		// first, update the map boundary to whatever address they just searched for
		_searchStarted = true;
		if (msg.data.viewportObj) {
			_map.fitBounds(msg.data.viewportObj);
		} else {
			_map.setCenter(msg.data.locationObj);
			_map.setZoom(12); // good for notable...
		}

		_addSearchRangeIndicator();

		if (_currSearchType === "all") {

		} else if (_currSearchType === "notable") {
			_getNotableSightings({
				lat: lat,
				lng: lng,
				observationRecency: msg.data.searchOptions.allAndNotable.observationRecency
			});
			_lastSearchObservationRecency = msg.data.searchOptions.allAndNotable.observationRecency;
		} else if (_currSearchType === "hotspots") {
			_getHotspots({
				lat: lat,
				lng: lng,
				limitByObservationRecency: msg.data.searchOptions.hotspots.limitByObservationRecency,
				observationRecency: msg.data.searchOptions.hotspots.observationRecency
			});
			_lastSearchObservationRecency = msg.data.searchOptions.hotspots.observationRecency;
		}
	};

	var _resizeMap = function(msg) {
		var data = msg.data;

		if (data.viewportMode == "desktop") {
			$("#panelContent").css("height", data.height - 88);
		} else {
			$("#panelContent").css("height", data.height - 40);
		}
	};

	/**
	 * Searches a regions for notable sightings.
	 */
	var _getNotableSightings = function(searchParams) {
		$.ajax({
			url: "ajax/getNotableSightings.php",
			data: searchParams,
			type: "POST",
			dataType: "json",
			success: function(response) {
				_lastSearchNotableSightings = dataCache.formatNotableSightingsData(response);
				_clearHotspots();

				// this adds as many as possible to the map - but many may be out of bounds.
				_addHotspotMarkers("notable", _lastSearchNotableSightings);
				_searchStarted = false;
				helper.stopLoading();

				mediator.publish(_MODULE_ID, C.EVENT.MAP.NOTABLE_MARKERS_ADDED, {
					locations: _visibleHotspots,
					lastSearchObservationRecency: _lastSearchObservationRecency
				});
			},
			error: function(response) {
//				console.log("error", arguments, response);
				helper.stopLoading();
			}
		});
	};

	/**
	 * Searches a regions for hotspots.
	 */
	var _getHotspots = function(searchParams) {
		$.ajax({
			url: "ajax/getHotspotLocations.php",
			data: searchParams,
			type: "POST",
			dataType: "json",
			success: function(response) {
				_lastSearchAllHotspots = dataCache.formatHotspotData(response);
				_clearHotspots();

				// this adds as many as possible to the map - but many may be out of bounds.
				_addHotspotMarkers("hotspots", _lastSearchAllHotspots);
				_searchStarted = false;
				helper.stopLoading();

				mediator.publish(_MODULE_ID, C.EVENT.MAP.HOTSPOT_MARKERS_ADDED, {
					hotspots: _visibleHotspots
				});
			},
			error: function(response) {
				console.log("error", arguments, response);
				helper.stopLoading();
			}
		});
	};

	var _onTabChanged = function(msg) {
		if (msg.data.tab === "mapTab") {
			_redrawMap();
		}
		_currTab = msg.data.tab;
	};

	var _redrawMap = function() {
		google.maps.event.trigger(_map, "resize");
	};

	var _addSearchRangeIndicator = function() {

		// lame, but setting the map to null doesn't work, so keep adding more & hiding the previous
		if (_circleOverlayIndex > 0) {
			_circleOverlays[_circleOverlayIndex-1].set("visible", false);
		}

		_circleOverlays[_circleOverlayIndex] = new InvertedCircle({
			center: _map.getCenter(),
			map: _map,
			radius: _searchTypeCircleRadius[_currSearchType],
			editable: false,
			stroke_weight: 0,
			always_fit_to_map: false
		});
		_circleOverlayIndex++;
	};


	/**
	 * Adds hotspots to the map for any of the three search types: all, notable, hotspots. The first
	 * param specifies the search type; the second is a standardized array of hotspot data. Format:
	 *   {
	 *		locationID: ...
	 *		lat: ...
	 *		lng: ...
	 *		n: ... (location name)
	 *   }
	 * The objects can contain any additional info needed; they're just ignored.
	 *
	 * @param searchType
	 * @param hotspots
	 * @private
	 */
	var _addHotspotMarkers = function(searchType, data) {
		var mapBoundary = _map.getBounds();
		var boundsObj = new google.maps.LatLngBounds(mapBoundary.getSouthWest(), mapBoundary.getNorthEast());
		_visibleHotspots = [];

		for (var i=0; i<data.length; i++) {
			var currMarkerInfo = data[i];
			var locationID = currMarkerInfo.locationID;
			var latlng = new google.maps.LatLng(currMarkerInfo.lat, currMarkerInfo.lng);
			if (!boundsObj.contains(latlng)) {
				continue;
			}

			if (searchType === "hotspots") {
				if (_hotspotMarkers.hasOwnProperty(locationID)) {
					if (_hotspotMarkers[locationID].map === null) {
						_hotspotMarkers[locationID].setMap(_map);
					}
				} else {
					_hotspotMarkers[locationID] = new google.maps.Marker({
						position: latlng,
						map: _map,
						title: currMarkerInfo.n,
						icon: _icon,
						locationID: locationID
					});
					_hotspotInfoWindows[locationID] = new google.maps.InfoWindow();

					(function(marker, infoWindow, locID, locName) {
						google.maps.event.addListener(marker, "click", function() {
							infoWindow.setContent(locName);
							infoWindow.open(_map, this);
						});
					})(_hotspotMarkers[locationID], _hotspotInfoWindows[locationID], locationID, currMarkerInfo.n);
				}

			} else if (searchType === "notable") {

				if (_notableMarkers.hasOwnProperty(locationID)) {
					if (_notableMarkers[locationID].map === null) {
						_notableMarkers[locationID].setMap(_map);
					}
				} else {
					_notableMarkers[locationID] = new google.maps.Marker({
						position: latlng,
						map: _map,
						title: currMarkerInfo.n,
						icon: _icon,
						locationID: locationID
					});
					_notableInfoWindows[locationID] = new google.maps.InfoWindow();

					(function(marker, infoWindow, locInfo) {
						google.maps.event.addListener(marker, "click", function() {
							infoWindow.setContent(_getNotableSightingInfoWindow(locInfo));
							infoWindow.open(_map, this);
						});
					})(_notableMarkers[locationID], _notableInfoWindows[locationID], currMarkerInfo);
				}
			}

			_visibleHotspots.push(currMarkerInfo);
		}
	};

	var _getNotableSightingInfoWindow = function(locInfo) {
		var html = _.template(notableSightingsInfoWindowTemplate, {
			L: helper.L,
			sightings: locInfo.sightings,
			locationName: locInfo.n,
			locationID: locInfo.locationID
		});

		// render the template
		return html;
	};

	// clears the map. Note that we DON'T reset _markers. That retains the information loaded for as long as the user's
	// session so we don't re-request the same info from eBird
	var _clearHotspots = function() {
		for (var locationID in _hotspotMarkers) {
			_hotspotMarkers[locationID].setMap(null);
		}
		for (var locationID in _notableMarkers) {
			_notableMarkers[locationID].setMap(null);
		}
	};

	var _onLocationMouseover = function(msg) {
		var locationID = msg.data.locationID;
		_searchTypeData[_currSearchType].markers[locationID].setIcon("images/marker2.png");
		_searchTypeData[_currSearchType].markers[locationID].setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
	};

	var _onLocationMouseout = function(msg) {
		var locationID = msg.data.locationID;
		_searchTypeData[_currSearchType].markers[locationID].setIcon("images/marker.png");
	};

	var _onLocationClick = function(msg) {

		// if the map tab isn't open, don't worry aboutDialog it
		if (_currTab !== "mapTab") {
			return;
		}

		var locationID = msg.data.locationID;
		var openInfoWindows = _searchTypeData[_currSearchType].openInfoWindows;
		var infoWindows     = _searchTypeData[_currSearchType].infoWindows;
		var markers         = _searchTypeData[_currSearchType].markers;

		if ($.inArray(locationID, openInfoWindows) !== -1) {
			infoWindows[locationID].close();

			// remove it from the array
			openInfoWindows.splice($.inArray(locationID, openInfoWindows), 1);
		} else {
			google.maps.event.trigger(markers[locationID], "click");
			openInfoWindows.push(locationID);
		}
	};

	//calculates distance between two points in km's
//	var _calcDistance = function(p1, p2){
//		return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
//	}

	mediator.register(_MODULE_ID, {
		init: _init
	});

	return {
		create: _create
	};
});