/*jslint browser:true*/
/*global $:false,google:false,console:false,manager:false*/
'use strict';


var map = {

	defaultMapOptions: {
		center: new google.maps.LatLng(20, 12),
		zoom: 2,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: true,
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
			position: google.maps.ControlPosition.TOP_RIGHT
		},
		panControl: true,
			panControlOptions: {
			position: google.maps.ControlPosition.RIGHT_BOTTOM
		},
		zoomControl: true,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.LARGE,
			position: google.maps.ControlPosition.RIGHT_BOTTOM
		},
		scaleControl: true,
		scaleControlOptions: {
			position: google.maps.ControlPosition.BOTTOM_LEFT
		},
		streetViewControl: false
	},

	mapCanvas: null,
	el: null,
	icon: 'resources/images/marker.png',
	geocoder: null,

	/**
	 * Called by search's init function.
	 */
	initialize: function() {
		map.mapCanvas = $('#mapTabContent')[0];
		map.el        = new google.maps.Map(map.mapCanvas, map.defaultMapOptions);
		map.geocoder  = new google.maps.Geocoder();

		var autocomplete = new google.maps.places.Autocomplete(manager.searchField);
		autocomplete.bindTo('bounds', map.el);

		// executed whenever the user selects a place through the auto-complete function
		google.maps.event.addListener(autocomplete, 'place_changed', function() {
			var place = autocomplete.getPlace();

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
		});

		// called any time the map viewport is changed. This is incomplete: it should re-request all data based on the
		// new lat-lng boundaries
		/*
		google.maps.event.addListener(map.el, 'center_changed', function() {
			// if there's already a search underway, do nothing
			if (manager.activeHotspotRequest) {
				return;
			}
		});*/
	},

	displayHotspots: function(data) {

		// make a note that the hotspot request has completed
		manager.activeHotspotRequest = false;

		var mapBoundary = map.el.getBounds();
		var boundsObj = new google.maps.LatLngBounds(mapBoundary.getSouthWest(), mapBoundary.getNorthEast());
		var foundResults = [];

		var counter = 0;
		for (var i=0; i<data.length; i++) {
			var latlng = new google.maps.LatLng(data[i].lt, data[i].lg);

			if (!boundsObj.contains(latlng)) {
				continue;
			}
			if (counter > manager.maxNumHotspots) {
				break;
			}

			var marker = new google.maps.Marker({
				position: latlng,
				map: map.el,
				title: data[i].n,
				icon: map.icon,
				locationID: data[i].i
			});

			// this sucks - move to helper function & bypass closures
			// google.maps.event.addListener(marker, 'click', function() {
			// 	$.ajax({
			// 		url: "ajax/getHotspotObservations.php",
			// 		data: {
			// 			locationID: marker.locationID
			// 		},
			// 		type: "POST",
			// 		dataType: "json",
			// 		success: map.displayHotspotObservations,
			// 		error: function(response) {
			// 			console.log("error: ", response);
			// 		}
			// 	});

			// 	map.el.setZoom(8);
			// 	map.el.setCenter(marker.getPosition());
			// });

			foundResults.push(data[i]);
			counter++;
		}

		// pass the hotspot data over to the main search
		manager.onDisplayHotspots(foundResults);
	},


/*	reverseGeocode: function(lat, lng) {
		var position = new google.maps.LatLng(lat, lng);
//		var city, region, country;
		map.geocoder.geocode({ latLng: position}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				console.log(results[j].address_components);

				if (results[1]) {
					var indice=0;
					for (var j=0; j<results.length; j++) {
						if (results[j].types[0]=='locality') {
							indice=j;
							break;
						}
					}

					// for (var i=0; i<results[j].address_components.length; i++) {
					// 	if (results[j].address_components[i].types[0] == "locality") {
					// 		//this is the object you are looking for
					// 		city = results[j].address_components[i];
					// 	}
					// 	if (results[j].address_components[i].types[0] == "administrative_area_level_1") {
					// 		//this is the object you are looking for
					// 		region = results[j].address_components[i];
					// 	}
					// 	if (results[j].address_components[i].types[0] == "country") {
					// 		//this is the object you are looking for
					// 		country = results[j].address_components[i];
					// 	}
					// }

					//city data
					// console.log((city.long_name + " || " + region.long_name + " || " + country.short_name)
				} else {

				}
			} else {

			}
		});
	},*/

};
