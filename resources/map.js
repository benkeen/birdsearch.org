/*global $:false,google:false*/
$(function() {
	'use strict';

	var _defaultMapOptions = {
		center: new google.maps.LatLng(-33.8688, 151.2195),
		zoom: 13,
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
	};

	var _mapCanvas = $('#mapCanvas')[0];
	var _map = null;
	var _searchField = $('#searchTextField')[0];
	var _icon = 'resources/images/marker.png';


	function initialize() {
		_map = new google.maps.Map(_mapCanvas, _defaultMapOptions);
		var autocomplete = new google.maps.places.Autocomplete(_searchField);
		autocomplete.bindTo('bounds', _map);

		google.maps.event.addListener(autocomplete, 'place_changed', function() {
			var place = autocomplete.getPlace();

			// inform the user that the place was not found and return
			if (!place.geometry) {
				//input.className = '';
				//input.className = 'notfound';
				return;
			}

			// if the place has a geometry, then present it on a map
			if (place.geometry.viewport) {
				_map.fitBounds(place.geometry.viewport);
			} else {
				_map.setCenter(place.geometry.location);
				_map.setZoom(17);
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

			$.ajax({
				url: "ajax/getHotspots.php",
				data: {
					regionType: regionType,
					region: region
				},
				type: "POST",
				dataType: "json",
				success: displayHotspots,
				error: function(response) {
					console.log("error: ", response);
				}
			});
		});
	};

	function displayHotspots(data) {
		for (var i=0; i<data.length; i++) {
			var latlng = new google.maps.LatLng(data[i].lt, data[i].lg);
			var marker = new google.maps.Marker({
				position: latlng,
				map: _map,
				title: data[i].n,
				icon: _icon,
				locationID: data[i].i
			});

			google.maps.event.addListener(marker, 'click', function() {
				
				// request the 
				$.ajax({
					url: "ajax/getHotspotObservations.php",
					data: {
						locationID: marker.locationID
					},
					type: "POST",
					dataType: "json",
					success: displayHotspotObservations,
					error: function(response) {
						console.log("error: ", response);
					}
				});

				_map.setZoom(8);
				_map.setCenter(marker.getPosition());
			});
		}
	};

	function displayHotspotObservations(response) {
		console.log("!!!");
		console.log(response);
	};

	initialize();
});
