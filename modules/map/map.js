define([
	"manager",
	"constants"
], function(manager, C) {
	"use strict";

	var _MODULE_ID = "map";
	var _mapCanvas;
	var _map;

	var _defaultMapOptions = {
		center: new google.maps.LatLng(20, 12),
		zoom: 2,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControlOptions: { mapTypeIds: [] },
		streetViewControl: false
	};


	var _init = function() {
		var subscriptions = {};
		subscriptions[C.EVENT.WINDOW_RESIZE] = _resizeMap;
		subscriptions[C.EVENT.SELECT_TAB] = _onSelectTab;
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

	var _onSelectTab = function(msg) {
		if (msg.data.tab === "mapTab") {
			_redrawMap();
		}
	};

	var _redrawMap = function() {
		google.maps.event.trigger(_map, 'resize');
	};


	manager.register(_MODULE_ID, {
		init: _init
	});

	return {
		create: _create
	};
});