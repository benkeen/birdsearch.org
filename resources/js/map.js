/*jslint browser:true*/
/*global $:false,google:false,console:false,manager:false*/
'use strict';


var map = {

	defaultMapOptions: {
		center: new google.maps.LatLng(20, 12),
		zoom: 2,
		mapTypeId: google.maps.MapTypeId.TERRAIN,
		mapTypeControlOptions: { mapTypeIds: [] },
		streetViewControl: false
	},

	mapCanvas: null,
	el: null,
	icon: 'resources/images/marker.png',
	geocoder: null,

	markers: {},


	/**
	 * Called by search's init function.
	 */
	initialize: function() {
		map.mapCanvas = $('#mapTabContent')[0];
		map.el        = new google.maps.Map(map.mapCanvas, map.defaultMapOptions);
		map.geocoder  = new google.maps.Geocoder();

		map.addCustomControls();

		map.autocomplete = new google.maps.places.Autocomplete(manager.searchField);
		map.autocomplete.bindTo('bounds', map.el);

		// executed whenever the user selects a place through the auto-complete function
		google.maps.event.addListener(map.autocomplete, 'place_changed', map.onAutoComplete);

		// called any time the map has just been dragged
		google.maps.event.addListener(map.el, 'dragend', map.onMapDragEnd);
	},


	onAutoComplete: function() {
		var place = map.autocomplete.getPlace();

		// inform the user that the place was not found and return
		if (!place.geometry) {
			return;
		}

		if (place.geometry.viewport) {
			map.el.fitBounds(place.geometry.viewport);
		} else {
			map.el.setCenter(place.geometry.location);
			map.el.setZoom(17);
		}

		var numAddressComponents = place.address_components.length;
		var countryCode = place.address_components[numAddressComponents-1].short_name;
		var subNational1Code = null;
		var subNational2Code = null;

		if (numAddressComponents > 1) {
			subNational1Code = place.address_components[numAddressComponents-2].short_name;
		}
		if (numAddressComponents > 2) {
			subNational2Code = place.address_components[numAddressComponents-2].short_name;
		}

		var regionType = null;
		var region = null;
		switch (numAddressComponents) {
			case 1:
				regionType = "country";
				region = countryCode;
				break;
			case 2:
				regionType = "subnational1";
				region = countryCode + "-" + subNational1Code;
				break;
			default:
				regionType = "subnational1";
				region = countryCode + "-" + subNational1Code;
				break;
		}

		// not terribly pretty, but simple enough for now
		manager.regionType = regionType;
		manager.region = region;
		manager.getHotspots();
	},

	onMapDragEnd: function() {
		if (manager.activeHotspotRequest) {
			return;
		}
		map.addMarkers();
	},

	addCustomControls: function() {
		var btn1 = $('<div class="mapBtn mapBtnSelected">Terrain</div>')[0];
		var btn2 = $('<div class="mapBtn">Road Map</div>')[0];
		var btn3 = $('<div class="mapBtn">Satellite</div>')[0];
		var btn4 = $('<div class="mapBtn">Hybrid</div>')[0];

		// add the controls to the map
		map.el.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn4);
		map.el.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn3);
		map.el.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn2);
		map.el.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn1);

		// add the appropriate event handlers
		google.maps.event.addDomListener(btn1, 'click', function() {
			map.el.setMapTypeId(google.maps.MapTypeId.TERRAIN);
			$(".mapBtn").removeClass('mapBtnSelected');
			$(btn1).addClass('mapBtnSelected');
		});
		google.maps.event.addDomListener(btn2, 'click', function() {
			map.el.setMapTypeId(google.maps.MapTypeId.ROADMAP);
			$(".mapBtn").removeClass('mapBtnSelected');
			$(btn2).addClass('mapBtnSelected');
		});
		google.maps.event.addDomListener(btn3, 'click', function() {
			map.el.setMapTypeId(google.maps.MapTypeId.SATELLITE);
			$(".mapBtn").removeClass('mapBtnSelected');
			$(btn3).addClass('mapBtnSelected');
		});
		google.maps.event.addDomListener(btn4, 'click', function() {
			map.el.setMapTypeId(google.maps.MapTypeId.HYBRID);
			$(".mapBtn").removeClass('mapBtnSelected');
			$(btn4).addClass('mapBtnSelected');
		});
	},

	clear: function() {
		for (var locationID in map.markers) {
			map.markers[locationID].setMap(null);
		}
		map.markers = {};
	},


	addMarkers: function() {
		var data = manager.allHotspots;
		if (data === null) {
			return;
		}

		// make a note that the hotspot request has completed
		manager.activeHotspotRequest = false;

		var mapBoundary = map.el.getBounds();
		var boundsObj = new google.maps.LatLngBounds(mapBoundary.getSouthWest(), mapBoundary.getNorthEast());

		var visibleHotspots = [];
		for (var locationID in data) {
			var currHotspot = data[locationID];
			var latlng = new google.maps.LatLng(currHotspot.lt, currHotspot.lg);

			if (!boundsObj.contains(latlng)) {
				continue;
			}

			var currMarker = new google.maps.Marker({
				position: latlng,
				map: map.el,
				title: currHotspot.n,
				icon: map.icon,
				locationID: currHotspot.i,
				infoWindowHTML: '<p><b>' + currHotspot.n + '</b></p><p><a href="#" class="viewLocationBirds" data-location="' + currHotspot.i + '">View bird species spotted at this location</a></p>'
			});

			map.markers[currHotspot.i] = currMarker;
			var infoWindow = new google.maps.InfoWindow();

			// this sucks - move to helper function...
			google.maps.event.addListener(currMarker, 'click', function() {
				infoWindow.setContent(this.infoWindowHTML);
				infoWindow.open(map.el, this);
			});

			visibleHotspots.push(locationID);
		}

		// pass the visible hotspot data over to the main search
		manager.onDisplayHotspots(visibleHotspots);
	}
};
