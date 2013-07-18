define([
	"manager"
], function(manager) {
	"use strict";


	var MODULE_ID = "map";

	var _mapCanvas;
	var _geocoder;
	var _el;

	var _defaultMapOptions = {
		center: new google.maps.LatLng(20, 12),
		zoom: 2,
		mapTypeId: google.maps.MapTypeId.TERRAIN,
		mapTypeControlOptions: { mapTypeIds: [] },
		streetViewControl: false
	};


	/**
	 * Called manually by mainPanel.js after the panel has been created.
	 * @private
	 */
	var _create = function() {
		_mapCanvas = $('#mapTabContent')[0];
		_el        = new google.maps.Map(_mapCanvas, _defaultMapOptions);
		_geocoder  = new google.maps.Geocoder();

		_addCustomControls();

		// called any time the map has had its bounds changed
		google.maps.visualRefresh = true;
		google.maps.event.addListener(_el, 'dragend', _onMapBoundsChange);
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

	var _onMapBoundsChange = function() {

	};


	manager.register(MODULE_ID, {

	});

	return {
		create: _create
	};
});