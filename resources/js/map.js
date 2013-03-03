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
	infoWindows: {},
	lastAddressSearchValid: null,


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

		// called any time the map has had it's bounds changed
		google.maps.event.addListener(map.el, 'dragend', map.onMapBoundsChange);
		google.maps.event.addListener(map.el, 'zoom_changed', map.onMapBoundsChange);
	},


	onAutoComplete: function() {

		// assume the worst
		map.lastAddressSearchValid = false;

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


		// if the address isn't specific enough, let the user know to provide a more details
		if (numAddressComponents < 3) {
			manager.showMessage('Please enter a more specific location.', 'error');
			return;
		}

		// alrighty, the search was valid. Make a note!
		map.lastAddressSearchValid = true;

		$('#messageBar').addClass('hidden');
		var subNational1Code = place.address_components[numAddressComponents-2].short_name;
		manager.regionType = 'subnational1';
		manager.region = countryCode + "-" + subNational1Code;
		manager.getHotspots();
	},

	onMapBoundsChange: function() {
		if (manager.activeHotspotRequest || !map.lastAddressSearchValid) {
			return;
		}
		manager.updatePage(false);
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

	// clears the map. Note that we DON'T reset map.markers. That retains the information loaded for as long as the user's
	// session so we don't re-request the same info from eBird
	clear: function() {
		for (var locationID in map.markers) {
			map.markers[locationID].setMap(null);
		}
	},

	/**
	 * Called after the hotspot locations are available, but not necessarily the observations. As such, it returns
	 * an array of hotspots that fit within the current map viewport. Whether or not they're actually shown depends on
	 * their observation data. For new searches, it's guaranteed they'll show up (because the original hotspot search
	 * included the recency, so there's at least one observation) but in other cases - like when the user is selecting
	 * a shorter observation recency for an already-loaded hotspot, the location may well not show up.
	 */
	addMarkersAndReturnVisible: function(clearMarkers) {
		if (clearMarkers) {
			map.clear();
		}

		if ($.isEmptyObject(manager.allHotspots)) {
			manager.stopLoading();
			return [];
		}

		var mapBoundary = map.el.getBounds();
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

			if (map.markers.hasOwnProperty(locationID)) {
				if (map.markers[locationID].map === null) {
					console.log("adding back formerly hidden marker: ", locationID);
					map.markers[locationID].setMap(map.el);
				}
			} else {
				map.markers[locationID] = new google.maps.Marker({
					position: latlng,
					map: map.el,
					title: currHotspot.n,
					icon: map.icon,
					locationID: locationID
				});
				map.infoWindows[locationID] = new google.maps.InfoWindow();

				(function(marker, infowindow, locationID) {
					google.maps.event.addListener(marker, 'click', function() {
						infowindow.setContent(map.getInfoWindowHTML(locationID));
						infowindow.open(map.el, this);
					});
				})(map.markers[currHotspot.i], map.infoWindows[currHotspot.i], currHotspot.i);
			}

			visibleHotspots.push(locationID);
			counter++;
		}

		return visibleHotspots;
	},

	/**
	 * This function is called after a change to the receny
	 */
	addMarkersInRangeAndRecency: function() {
		if ($.isEmptyObject(manager.allHotspots)) {
			manager.stopLoading();
			return [];
		}

		var mapBoundary = map.el.getBounds();
		var boundsObj = new google.maps.LatLngBounds(mapBoundary.getSouthWest(), mapBoundary.getNorthEast());
		var foundHotspots = [];
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

			var recencyKey = manager.observationRecency + 'day';
			if (!currHotspot.observations[manager.searchType][recencyKey].available) {
				continue;
			}

			// nope! Need another test here. It needs to look through this entry and all 
			// with a lower observation frequency to confirm there's at least ONE species seen. Otherwise
			// there's no point displaying this/
			if (!manager.hasAtLeastOneObservationWithinRecency(locationID, manager.searchType, manager.observationRecency)) {
				continue;
			}

			map.markers[currHotspot.i] = new google.maps.Marker({
				position: latlng,
				map: map.el,
				title: currHotspot.n,
				icon: map.icon,
				locationID: currHotspot.i
			});
			map.infoWindows[currHotspot.i] = new google.maps.InfoWindow();

			(function(marker, infowindow, locationID) {
				google.maps.event.addListener(marker, 'click', function() {
					infowindow.setContent(map.getInfoWindowHTML(locationID));
					infowindow.open(map.el, this);
				});
			})(map.markers[locationID], map.infoWindows[locationID], locationID);

			foundHotspots.push(locationID);
			counter++;
		}

		return foundHotspots;
	},

	getInfoWindowHTML: function(locationID) {
		var html = '<div class="hotspotDialog"><p><b>' + manager.allHotspots[locationID].n + '</b></p>' +
			'<p><a href="#" class="viewLocationBirds" data-location="' + locationID + '">View bird species spotted at this location <b>(X)</b></a></p></div>';

		return html;
	}
};
