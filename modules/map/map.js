define([
	"mediator",
	"constants",
	"moduleHelper",
	"dataCache",
	"text!notableSightingsInfoWindowTemplate",
	"text!allSightingsInfoWindowTemplate"
], function(mediator, C, helper, dataCache, notableSightingsInfoWindowTemplate, allSightingsInfoWindowTemplate) {
	"use strict";

	var _MODULE_ID = "map";
	var _mapCanvas;
	var _map;
	var _icon = "images/marker.png";
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
	var _L = {};

	// general fields relating to search
	var _searchStarted = false;
	var _circleOverlayIndex = 0;
	var _circleOverlays = [];
	var _visibleHotspots = [];

	// details about the last search
	var _lastSearch = {
		searchType: null,
		latLng: null,
		observationRecency: null
	};

	// stores all map-related data, grouped by search type
	var _data = {
		all: {
			defaultZoomLevel: 11,
			circleRadius: 60000,
			lastSearch: [],
			infoWindows: {},
			openInfoWindows: [],
			markers: {}
		},
		notable: {
			defaultZoomLevel: 7,
			circleRadius: 250000,
			lastSearch: [],
			infoWindows: {},
			openInfoWindows: [],
			markers: {}
		},
		hotspots: {
			defaultZoomLevel: 11,
			circleRadius: 60000,
			lastSearch: [],
			infoWindows: {},
			openInfoWindows: [],
			markers: {}
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

		require([helper.getCurrentLangFile()], function(L) {
			_L = L;
		});
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
		$(document).on("click", ".viewLocationSightingDetails", _onClickViewLocationSightings);
	};

	var _onClickViewFullNotableDetails = function(e) {
		e.preventDefault();
		var locationID = $(e.target).data("locationId");

		mediator.publish(_MODULE_ID, C.EVENT.MAP.VIEW_NOTABLE_SIGHTING_SINGLE_LOCATION, {
			locationID: locationID
		});
	};

	var _onClickViewLocationSightings = function(e) {
		e.preventDefault();
		var locationID = $(e.target).data("locationId");

		mediator.publish(_MODULE_ID, C.EVENT.MAP.VIEW_SIGHTINGS_SINGLE_LOCATION, {
			locationID: locationID
		});
	};


	var _onMapBoundsChange = function() {
		if (_searchStarted) {
			return;
		}

		_clearHotspots();

		// this adds as many as possible to the map - but many may be out of bounds
		switch (_lastSearch.searchType) {
			case "all":
				_addMarkers("all", _data.all.lastSearch);
				mediator.publish(_MODULE_ID, C.EVENT.MAP.BIRD_MARKERS_ADDED, {
					locations: _visibleHotspots,
					lastSearchObservationRecency: _lastSearch.observationRecency
				});
				break;

			case "notable":
				_addMarkers("notable", _data.notable.lastSearch);
				mediator.publish(_MODULE_ID, C.EVENT.MAP.NOTABLE_MARKERS_ADDED, {
					locations: _visibleHotspots,
					lastSearchObservationRecency: _lastSearch.observationRecency
				});
				break;

			case "hotspots":
				_addMarkers("hotspots", _data.hotspots.lastSearch);
				mediator.publish(_MODULE_ID, C.EVENT.MAP.HOTSPOT_MARKERS_ADDED, {
					hotspots: _visibleHotspots
				});
				break;
		}
	};

	var _onSearch = function(msg) {

		// make a note of the search type
		_lastSearch.searchType = msg.data.resultType;

		var lat = msg.data.locationObj.lat();
		var lng = msg.data.locationObj.lng();

		_lastSearch.latLng = msg.data.locationObj;

		// first, update the map boundary to whatever address they just searched for
		_searchStarted = true;
		if (msg.data.viewportObj) {
			_map.fitBounds(msg.data.viewportObj);

		} else {
			_map.setCenter(msg.data.locationObj);
		}

		_map.setZoom(_data[_lastSearch.searchType].defaultZoomLevel);

		_addSearchRangeIndicator();

		if (_lastSearch.searchType === "all") {
			_getBirdSightings({
				lat: lat,
				lng: lng,
				limitByObservationRecency: true,
				observationRecency: msg.data.searchOptions.allAndNotable.observationRecency
			});
			_lastSearch.observationRecency = msg.data.searchOptions.allAndNotable.observationRecency;
		} else if (_lastSearch.searchType === "notable") {
			_getNotableSightings({
				lat: lat,
				lng: lng,
				observationRecency: msg.data.searchOptions.allAndNotable.observationRecency
			});
			_lastSearch.observationRecency = msg.data.searchOptions.allAndNotable.observationRecency;
		} else if (_lastSearch.searchType === "hotspots") {
			_getHotspots({
				lat: lat,
				lng: lng,
				limitByObservationRecency: msg.data.searchOptions.hotspots.limitByObservationRecency,
				observationRecency: msg.data.searchOptions.hotspots.observationRecency
			});
			_lastSearch.observationRecency = msg.data.searchOptions.hotspots.observationRecency;
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
	 * Searches a region for bird sightings.
	 */
	var _getBirdSightings = function(searchParams) {
		$.ajax({
			url: "ajax/getHotspotLocations.php",
			data: searchParams,
			type: "POST",
			dataType: "json",
			success: function(response) {
				_data.all.lastSearch = dataCache.formatHotspotData(response);
				_clearHotspots();

				// this adds as many as possible to the map - but many may be out of bounds.
				_addMarkers("all", _data.all.lastSearch);
				_searchStarted = false;
				helper.stopLoading();

				mediator.publish(_MODULE_ID, C.EVENT.MAP.BIRD_MARKERS_ADDED, {
					locations: _visibleHotspots,
					lastSearchObservationRecency: _lastSearch.observationRecency
				});
			},
			error: function(response) {
				helper.stopLoading();
			}
		});
	};

	/**
	 * Searches a region for notable sightings.
	 */
	var _getNotableSightings = function(searchParams) {
		$.ajax({
			url: "ajax/getNotableSightings.php",
			data: searchParams,
			type: "POST",
			dataType: "json",
			success: function(response) {
				_data.notable.lastSearch = dataCache.formatNotableSightingsData(response);
				_clearHotspots();

				// this adds as many as possible to the map - but many may be out of bounds.
				_addMarkers("notable", _data.notable.lastSearch);
				_searchStarted = false;
				helper.stopLoading();

				mediator.publish(_MODULE_ID, C.EVENT.MAP.NOTABLE_MARKERS_ADDED, {
					locations: _visibleHotspots,
					lastSearchObservationRecency: _lastSearch.observationRecency
				});
			},
			error: function(response) {
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
				_data.hotspots.lastSearch = dataCache.formatHotspotData(response);
				_clearHotspots();

				// this adds as many as possible to the map - but many may be out of bounds.
				_addMarkers("hotspots", _data.hotspots.lastSearch);
				_searchStarted = false;
				helper.stopLoading();

				mediator.publish(_MODULE_ID, C.EVENT.MAP.HOTSPOT_MARKERS_ADDED, {
					hotspots: _visibleHotspots
				});
			},
			error: function(response) {
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
			radius: _data[_lastSearch.searchType].circleRadius,
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
	var _addMarkers = function(searchType, data) {
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

			if (searchType === "all") {
				_addBirdMarker(locationID, latlng, currMarkerInfo);
			} else if (searchType === "notable") {
				_addNotableMarker(locationID, latlng, currMarkerInfo);
			} else if (searchType === "hotspots") {
				_addHotspotMarker(locationID, latlng, currMarkerInfo);
			}

			_visibleHotspots.push(currMarkerInfo);
		}
	};

	var _addBirdMarker = function(locationID, latlng, currMarkerInfo) {
		if (_data.all.markers.hasOwnProperty(locationID)) {
			if (_data.all.markers[locationID].map === null) {
				_data.all.markers[locationID].setMap(_map);
			}
		} else {
			_data.all.markers[locationID] = new google.maps.Marker({
				position: latlng,
				map: _map,
				title: currMarkerInfo.n,
				icon: _icon,
				locationID: locationID
			});
			_data.all.infoWindows[locationID] = new google.maps.InfoWindow();

			(function(marker, infoWindow, locInfo) {
				google.maps.event.addListener(marker, "click", function() {
					infoWindow.setContent(_getBirdSightingInfoWindow(locInfo));
					infoWindow.open(_map, this);
				});
			})(_data.all.markers[locationID], _data.all.infoWindows[locationID], currMarkerInfo);
		}
	};

	var _addNotableMarker = function(locationID, latlng, currMarkerInfo) {
		if (_data.notable.markers.hasOwnProperty(locationID)) {
			if (_data.notable.markers[locationID].map === null) {
				_data.notable.markers[locationID].setMap(_map);
			}
		} else {
			_data.notable.markers[locationID] = new google.maps.Marker({
				position: latlng,
				map: _map,
				title: currMarkerInfo.n,
				icon: _icon,
				locationID: locationID
			});
			_data.notable.infoWindows[locationID] = new google.maps.InfoWindow();

			(function(marker, infoWindow, locInfo) {
				google.maps.event.addListener(marker, "click", function() {
					infoWindow.setContent(_getNotableSightingInfoWindow(locInfo));
					infoWindow.open(_map, this);
				});
			})(_data.notable.markers[locationID], _data.notable.infoWindows[locationID], currMarkerInfo);
		}
	};

	var _addHotspotMarker = function(locationID, latlng, currMarkerInfo) {
		if (_data.hotspots.markers.hasOwnProperty(locationID)) {
			if (_data.hotspots.markers[locationID].map === null) {
				_data.hotspots.markers[locationID].setMap(_map);
			}
		} else {
			_data.hotspots.markers[locationID] = new google.maps.Marker({
				position: latlng,
				map: _map,
				title: currMarkerInfo.n,
				icon: _icon,
				locationID: locationID
			});
			_data.hotspots.infoWindows[locationID] = new google.maps.InfoWindow();

			(function(marker, infoWindow, locID, locName) {
				google.maps.event.addListener(marker, "click", function() {
					locName = locName.replace(/\s+/g, "&nbsp;");
					infoWindow.setContent("<h4>" + locName + "</h4>");
					infoWindow.open(_map, this);
				});
			})(_data.hotspots.markers[locationID], _data.hotspots.infoWindows[locationID], locationID, currMarkerInfo.n);
		}
	};

	var _getBirdSightingInfoWindow = function(locInfo) {
		var numSightings = locInfo.sightings.data[_lastSearch.observationRecency].numSpeciesRunningTotal;
		var html = _.template(allSightingsInfoWindowTemplate, {
			L: _L,
			locationName: locInfo.n,
			locationID: locInfo.locationID,
			numSpecies: numSightings
		});

		// render the template
		return html;
	};

	var _getNotableSightingInfoWindow = function(locInfo) {
		var html = _.template(notableSightingsInfoWindowTemplate, {
			L: _L,
			sightings: locInfo.sightings,
			locationName: locInfo.n,
			locationID: locInfo.locationID
		});

		// render the template
		return html;
	};

	var _clearHotspots = function() {
		for (var locationID in _data.all.markers) {
			_data.all.markers[locationID].setMap(null);
		}
		for (var locationID in _data.notable.markers) {
			_data.notable.markers[locationID].setMap(null);
		}
		for (var locationID in _data.hotspots.markers) {
			_data.hotspots.markers[locationID].setMap(null);
		}
	};

	var _onLocationMouseover = function(msg) {
		var locationID = msg.data.locationID;
		_data[_lastSearch.searchType].markers[locationID].setIcon("images/marker2.png");
		_data[_lastSearch.searchType].markers[locationID].setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
	};

	var _onLocationMouseout = function(msg) {
		var locationID = msg.data.locationID;
		_data[_lastSearch.searchType].markers[locationID].setIcon("images/marker.png");
	};

	var _onLocationClick = function(msg) {
		// if the map tab isn't open, don't worry about it
		if (_currTab !== "mapTab") {
			return;
		}

		var locationID = msg.data.locationID;
		var openInfoWindows = _data[_lastSearch.searchType].openInfoWindows;
		var infoWindows     = _data[_lastSearch.searchType].infoWindows;
		var markers         = _data[_lastSearch.searchType].markers;

		if ($.inArray(locationID, openInfoWindows) !== -1) {
			infoWindows[locationID].close();

			// remove it from the array
			openInfoWindows.splice($.inArray(locationID, openInfoWindows), 1);
		} else {
			google.maps.event.trigger(markers[locationID], "click");
			openInfoWindows.push(locationID);

			if (_lastSearch.searchType === "all") {
				setTimeout(function() {
					$("#loc_" + locationID + "_numSpecies").html(msg.data.numSpecies);
				}, 1000);
			}
		}
	};

	mediator.register(_MODULE_ID, {
		init: _init
	});

	return {
		create: _create
	};
});