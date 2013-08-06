define([
	"mediator",
	"constants",
	"moduleHelper",
	"dataCache"
], function(mediator, C, helper, dataCache) {
	"use strict";

	var _MODULE_ID = "map";
	var _mapCanvas;
	var _map;
	var _markers = {};
	var _icon = 'images/marker.png';
	var _infoWindows = {};
	var _openInfoWindows = [];
	var _visibleHotspots = [];
	var _lastSearchAllHotspots = [];
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

	var _init = function() {
		var subscriptions = {};
		subscriptions[C.EVENT.WINDOW_RESIZE] = _resizeMap;
		subscriptions[C.EVENT.SELECT_TAB] = _onSelectTab;
		subscriptions[C.EVENT.SEARCH] = _onSearch;
		subscriptions[C.EVENT.HOTSPOT_LOCATION_MOUSEOVER] = _onHotspotLocationMouseover;
		subscriptions[C.EVENT.HOTSPOT_LOCATION_MOUSEOUT] = _onHotspotLocationMouseout;
		subscriptions[C.EVENT.HOTSPOT_LOCATION_CLICK] = _onHotspotLocationClick;
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

		// called any time the map has had its bounds changed
		google.maps.event.addListener(_map, 'dragend', _onMapBoundsChange);

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

	var _onMapBoundsChange = function() {
		// cool. This will need to detect when it's 25KM away from the original search, then do a fresh search
		console.log("distance from center:", _calcDistance(_lastSearchLatLng, _map.getCenter()));

		_clearHotspots();

		// this adds as many as possible to the map - but many may be out of bounds
		_addHotspotMarkers(_lastSearchAllHotspots);

		mediator.publish(_MODULE_ID, C.EVENT.MAP.HOTSPOT_MARKERS_ADDED, {
			hotspots: _visibleHotspots
		});


		/*
		if (_visibleHotspots.length > 0) {
		var html = mediator.generateHotspotTable(mediator.visibleHotspots);
		var locationStr = 'location';
		if (mediator.numVisibleHotspots > 1) {
		locationStr  = 'locations';
		}
		try {
		$('#hotspotTable').trigger("destroy");
		} catch (e) { }

		var numHotspotsStr = '';
		if (mediator.maxHotspotsReached) {
		numHotspotsStr = mediator.numVisibleHotspots + '+';
		} else {
		numHotspotsStr = mediator.numVisibleHotspots;
		}

		helper.showMessage('<b>' + numHotspotsStr + '</b> ' + locationStr + ' found', 'notification');

		if (mediator.currViewportMode === 'desktop') {
		$('#fullPageSearchResults').html(html).removeClass('hidden').fadeIn(300);
		} else {
		$('#locationsTabContent').html(html); //.removeClass('hidden').fadeIn(300);
		$('#locationsTab').removeClass('disabled').html('Locations <span>(' + mediator.numVisibleHotspots + ')</span>');
		}
		$('#hotspotTable').tablesorter({
		headers: { 2: { sorter: 'species' } }
		});
		} else {
		helper.showMessage('No birding locations found', 'notification');
		$('#fullPageSearchResults').fadeOut(300);
		mediator.stopLoading();
		}
		*/
	};

	var _lastSearchLatLng;
	var _onSearch = function(msg) {
		var lat = msg.data.locationObj.lat();
		var lng = msg.data.locationObj.lng();

		_lastSearchLatLng = msg.data.locationObj;

		// first, update the map boundary to whatever address they just searched for
		if (msg.data.viewportObj) {
			_map.fitBounds(msg.data.viewportObj);
		} else {
			_map.setCenter(place.geometry.locationObj);
			_map.setZoom(17);
		}

		if (msg.data.resultType === "all") {
			//mediator.getHotspots();
		} else if (msg.data.resultType === "notable") {
			//mediator.getNotableObservations();
		} else if (msg.data.resultType === "hotspots") {
			_getHotspots({
				lat: lat,
				lng: lng,
				limitByObservationRecency: msg.data.searchOptions.hotspots.limitByObservationRecency,
				observationRecency: msg.data.searchOptions.hotspots.observationRecency
			});
		}
	};

	var _resizeMap = function(msg) {
		var data = msg.data;

		if (data.viewportMode == "desktop") {
			$('#panelContent').css('height', data.height - 82);
		} else {
			$('#panelContent').css('height', data.height - 40);
		}
	};

	/**
	 * Searches a regions for hotspots.
	 */
	var _getHotspots = function(searchParams) {

		// TODO check cache here

		$.ajax({
			url: "ajax/getHotspotLocations.php",
			data: searchParams,
			type: "POST",
			dataType: "json",
			success: function(response) {
				_lastSearchAllHotspots = dataCache.formatHotspotData(response);
				_clearHotspots();

				// this adds as many as possible to the map - but many may be out of bounds.
				_addHotspotMarkers(_lastSearchAllHotspots);
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

	var _onSelectTab = function(msg) {
		if (msg.data.tab === "mapTab") {
			_redrawMap();
		}
	};

	var _redrawMap = function() {
		google.maps.event.trigger(_map, "resize");
	};


	var _addHotspotMarkers = function(hotspots) {
		var mapBoundary = _map.getBounds();
		var boundsObj = new google.maps.LatLngBounds(mapBoundary.getSouthWest(), mapBoundary.getNorthEast());
		_visibleHotspots = [];

		for (var i=0; i<hotspots.length; i++) {
			var currHotspotInfo = hotspots[i];
			var locationID = currHotspotInfo.locationID;
			var latlng = new google.maps.LatLng(currHotspotInfo.lat, currHotspotInfo.lng);
			if (!boundsObj.contains(latlng)) {
				continue;
			}

			if (_markers.hasOwnProperty(locationID)) {
				if (_markers[locationID].map === null) {
					_markers[locationID].setMap(_map);
				}
			} else {
				_markers[locationID] = new google.maps.Marker({
					position: latlng,
					map: _map,
					title: currHotspotInfo.n,
					icon: _icon,
					locationID: locationID
				});
				_infoWindows[locationID] = new google.maps.InfoWindow();

				(function(marker, infoWindow, locID, locName) {
					google.maps.event.addListener(marker, "click", function() {
						infoWindow.setContent(locName);
						infoWindow.open(_map, this);
					});
				})(_markers[locationID], _infoWindows[locationID], locationID, currHotspotInfo.n);
			}

			_visibleHotspots.push(currHotspotInfo);
		}
	};

	// clears the map. Note that we DON'T reset _markers. That retains the information loaded for as long as the user's
	// session so we don't re-request the same info from eBird
	var _clearHotspots = function() {
		for (var locationID in _markers) {
			_markers[locationID].setMap(null);
		}
	};


	var _getInfoWindowHTML = function(locationID) {
//		var numSpecies = mediator.allHotspots[locationID].observations[mediator.searchType][mediator.observationRecency + 'day'].numSpeciesRunningTotal;
//		var html = '<div class="hotspotDialog"><p><b>' + mediator.allHotspots[locationID].n + '</b></p>' +
//			'<p><a href="#" class="viewLocationBirds" data-location="' + locationID + '">View bird species spotted at this location <b>(' +
//			numSpecies + ')</b></a></p></div>';

	};


	var _onHotspotLocationMouseover = function(msg) {
		var locationID = msg.data.locationID;
		_markers[locationID].setIcon("images/marker2.png");
		_markers[locationID].setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
	};

	var _onHotspotLocationMouseout = function(msg) {
		var locationID = msg.data.locationID;
		_markers[locationID].setIcon("images/marker.png");
	};

	var _onHotspotLocationClick = function(msg) {
		var locationID = msg.data.locationID;
		if ($.inArray(locationID, _openInfoWindows) !== -1) {
			_infoWindows[locationID].close();
			// remove it from the array
			_openInfoWindows.splice($.inArray(locationID, _openInfoWindows), 1);
		} else {
			google.maps.event.trigger(_markers[locationID], "click");
			_openInfoWindows.push(locationID);
		}
	};


	//calculates distance between two points in km's
	var _calcDistance = function(p1, p2){
		return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
	}


	mediator.register(_MODULE_ID, {
		init: _init
	});

	return {
		create: _create
	};
});