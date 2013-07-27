define([
	"manager",
	"constants",
	"dataCache"
], function(manager, C, dataCache) {
	"use strict";

	var _MODULE_ID = "map";
	var _mapCanvas;
	var _map;
	var _markers = {};
	var _icon = 'images/marker.png';
	var _infoWindows = {};
	var _visibleHotspots = [];

	var _defaultMapOptions = {
		center: new google.maps.LatLng(20, 12),
		zoom: 2,
		mapTypeId: google.maps.MapTypeId.TERRAIN,
		mapTypeControlOptions: { mapTypeIds: [] },
		streetViewControl: false
	};


	var _init = function() {
		var subscriptions = {};
		subscriptions[C.EVENT.WINDOW_RESIZE] = _resizeMap;
		subscriptions[C.EVENT.SELECT_TAB] = _onSelectTab;
		subscriptions[C.EVENT.SEARCH] = _onSearch;
		manager.subscribe(_MODULE_ID, subscriptions);
	};

	/**
	 * Called manually by mainPanel.js after the panel has been created.
	 * @private
	 */
	var _create = function() {
		google.maps.visualRefresh = true;

		_mapCanvas = $('#mapTabContent')[0];
		_map       = new google.maps.Map(_mapCanvas, _defaultMapOptions);

		_addCustomControls();

		// called any time the map has had its bounds changed
		google.maps.event.addListener(_map, 'dragend', _onMapBoundsChange);

		manager.publish(_MODULE_ID, C.EVENT.TRIGGER_WINDOW_RESIZE);
	};


	var _addCustomControls = function() {
		var btn1 = $('<div class="mapBtn mapBtnSelected">Terrain</div>')[0];
		var btn2 = $('<div class="mapBtn">Road Map</div>')[0];
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

	};

	var _onSearch = function(msg) {

		// first, update the map boundary to whatever address they just searched for
		if (msg.data.viewportObj) {
			_map.fitBounds(msg.data.viewportObj);
		} else {
			_map.setCenter(place.geometry.locationObj);
			_map.setZoom(17);
		}

		if (msg.data.resultType === "all") {
			//manager.getHotspots();
		} else if (msg.data.resultType === "notable") {
			//manager.getNotableObservations();
		} else if (msg.data.resultType === "hotspots") {
			_getHotspots(msg.data.lat, msg.data.lng);
		}
	}

	var _resizeMap = function(msg) {
		var data = msg.data;

		if (data.viewportMode == "desktop") {
			$('#panelContent').css('height', data.height - 82);
		} else {
			$('#panelContent').css('height', data.height - 40);
		}

//		if (manager.currTabID == 'mapTab') {
//			var address = $.trim(manager.searchField.value);
//			if (address !== '') {
//				manager.updatePage(false);
//			}
//		}
	};

	/**
	 * Retrieves all hotspots for a region.
	 */
	var _getHotspots = function(lat, lng) {

		// check cache here

		$.ajax({
			url: "ajax/getHotspotLocations.php",
			data: {
				lat: lat,
				lng: lng
			},
			type: "POST",
			dataType: "json",
			success: function(response) {
				dataCache.storeData("hotspots", response);
				_addHotspotMarkers();
				manager.stopLoading();

				manager.publish(_MODULE_ID, C.EVENT.MAP.HOTSPOT_MARKERS_ADDED, {
					numMarkers: _visibleHotspots.length
				});
			},
			error: function(response) {
				console.log("error", arguments, response);
				manager.stopLoading();
			}
		});
	};

	var _onSelectTab = function(msg) {
		if (msg.data.tab === "mapTab") {
			_redrawMap();
		}
	};

	var _redrawMap = function() {
		google.maps.event.trigger(_map, 'resize');
	};


	var _addHotspotMarkers = function() {
		var hotspots = dataCache.getHotspots();

		var mapBoundary = _map.getBounds();
		var boundsObj = new google.maps.LatLngBounds(mapBoundary.getSouthWest(), mapBoundary.getNorthEast());
		var counter = 1;
		_visibleHotspots = [];

		for (var locationID in hotspots) {
			var currHotspotInfo = hotspots[locationID].hotspotInfo;
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

				(function(marker, infoWindow, locID) {
					google.maps.event.addListener(marker, "click", function() {
						infoWindow.setContent(_getInfoWindowHTML(locID));
						infoWindow.open(_map, this);
					});
				})(_markers[locationID], _infoWindows[locationID], locationID);
			}

			_visibleHotspots.push(locationID);
			counter++;
		}
	};


	var onMapBoundaryUpdate = function() {

/*		if (_visibleHotspots.length > 0) {
			var html = manager.generateHotspotTable(manager.visibleHotspots);
			var locationStr = 'location';
			if (manager.numVisibleHotspots > 1) {
				locationStr  = 'locations';
			}

			try {
				$('#hotspotTable').trigger("destroy");
			} catch (e) { }

			var numHotspotsStr = '';
			if (manager.maxHotspotsReached) {
				numHotspotsStr = manager.numVisibleHotspots + '+';
			} else {
				numHotspotsStr = manager.numVisibleHotspots;
			}

			manager.showMessage('<b>' + numHotspotsStr + '</b> ' + locationStr + ' found', 'notification');

			if (manager.currViewportMode === 'desktop') {
				$('#fullPageSearchResults').html(html).removeClass('hidden').fadeIn(300);
			} else {
				$('#locationsTabContent').html(html); //.removeClass('hidden').fadeIn(300);
				$('#locationsTab').removeClass('disabled').html('Locations <span>(' + manager.numVisibleHotspots + ')</span>');
			}
			$('#hotspotTable').tablesorter({
				headers: { 2: { sorter: 'species' } }
			});
		} else {

			manager.showMessage('No birding locations found', 'notification');
			$('#fullPageSearchResults').fadeOut(300);
			manager.stopLoading();
		}
		*/
	};


	var _getInfoWindowHTML = function(locationID) {
//		var numSpecies = _manager.allHotspots[locationID].observations[_manager.searchType][_manager.observationRecency + 'day'].numSpeciesRunningTotal;
//		var html = '<div class="hotspotDialog"><p><b>' + manager.allHotspots[locationID].n + '</b></p>' +
//			'<p><a href="#" class="viewLocationBirds" data-location="' + locationID + '">View bird species spotted at this location <b>(' +
//			numSpecies + ')</b></a></p></div>';

		return locationID;
	};


	manager.register(_MODULE_ID, {
		init: _init
	});

	return {
		create: _create
	};
});