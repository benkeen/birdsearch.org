import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import { C, _, actions, helpers } from '../core/core';
import moment from 'moment';


var _icons = {
	range1: { url: 'images/markers/white.png', scaledSize: new google.maps.Size(21, 26) },
	range2: { url: 'images/markers/grey.png', scaledSize: new google.maps.Size(21, 26) },
	range3: { url: 'images/markers/sea-blue.png', scaledSize: new google.maps.Size(21, 26) },
	range4: { url: 'images/markers/turquoise.png', scaledSize: new google.maps.Size(21, 26) },
	range5: { url: 'images/markers/green.png', scaledSize: new google.maps.Size(21, 26) },
	range6: { url: 'images/markers/yellow.png', scaledSize: new google.maps.Size(21, 26) },
	range7: { url: 'images/markers/orange.png', scaledSize: new google.maps.Size(21, 26) },
	range8: { url: 'images/markers/red.png', scaledSize: new google.maps.Size(21, 26) },
	notable: { url: 'images/markers/notable.png', scaledSize: new google.maps.Size(21, 26) }
};
var _circleOverlays = {};
var _circleOverlayIndex = 0;
var _infoWindow; // as of 2.0.5 we only store a single infowindow at once. Feels cluttered otherwise

// stores all map-related data, grouped by search type
var _map;
var _data = {
	[C.SEARCH_SETTINGS.SEARCH_TYPES.ALL]: {
		defaultZoomLevel: 9,
		circleRadius: 60000,
		markers: {}
	},
	[C.SEARCH_SETTINGS.SEARCH_TYPES.NOTABLE]: {
		defaultZoomLevel: 7,
		circleRadius: 250000,
		markers: {}
	}
};

// any time the map boundary changes, the list of hotspots may change. This keeps a list of the hotspots within the
// boundary, ignoring what is visible on the map (i.e. via a location filter)
var _currentHotspotIDsInMapBoundaries = [];
var _currentSearchType;
var _suppressBoundaryChangeUpdate = false;


var styles = {
	[C.MAP_STYLES.DEFAULT]: [{
		"featureType": "road",
		"elementType": "geometry",
		"stylers": [{ "lightness": 100 }, { "visibility": "simplified" }]
	}, {
		"featureType": "water",
		"elementType": "geometry",
		"stylers": [{ "visibility": "on" }, { "color": "#C6E2FF" }]
	}, {
		"featureType": "poi",
		"elementType": "geometry.fill",
		"stylers": [{ "color": "#C5E3BF" }]
	}, { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#D1D1B8" }] }],
	[C.MAP_STYLES.GREY]: [{
		"featureType": "all",
		"elementType": "all",
		"stylers": [{ "hue": "#ff0000" }, { "saturation": -100 }, { "lightness": -30 }]
	}, {
		"featureType": "all",
		"elementType": "labels.text.fill",
		"stylers": [{ "color": "#ffffff" }]
	}, {
		"featureType": "all",
		"elementType": "labels.text.stroke",
		"stylers": [{ "color": "#353535" }]
	}, {
		"featureType": "landscape",
		"elementType": "geometry",
		"stylers": [{ "color": "#656565" }]
	}, {
		"featureType": "poi",
		"elementType": "geometry.fill",
		"stylers": [{ "color": "#505050" }]
	}, {
		"featureType": "poi",
		"elementType": "geometry.stroke",
		"stylers": [{ "color": "#808080" }]
	}, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#454545" }] }],
	[C.MAP_STYLES.DARK_GREY]: [{
		"featureType": "all",
		"elementType": "all",
		"stylers": [{ "visibility": "on" }]
	}, {
		"featureType": "all",
		"elementType": "geometry.stroke",
		"stylers": [{ "visibility": "off" }]
	}, {
		"featureType": "all",
		"elementType": "labels.text.fill",
		"stylers": [{ "saturation": 36 }, { "color": "#000000" }, { "lightness": "35" }, { "gamma": "1" }]
	}, {
		"featureType": "all",
		"elementType": "labels.text.stroke",
		"stylers": [{ "visibility": "off" }, { "color": "#000000" }, { "lightness": 16 }]
	}, {
		"featureType": "all",
		"elementType": "labels.icon",
		"stylers": [{ "visibility": "off" }]
	}, {
		"featureType": "administrative",
		"elementType": "geometry.fill",
		"stylers": [{ "color": "#000000" }, { "lightness": 20 }]
	}, {
		"featureType": "administrative",
		"elementType": "geometry.stroke",
		"stylers": [{ "color": "#000000" }, { "lightness": 17 }, { "weight": 1.2 }]
	}, {
		"featureType": "administrative.locality",
		"elementType": "all",
		"stylers": [{ "visibility": "simplified" }]
	}, {
		"featureType": "administrative.locality",
		"elementType": "geometry.fill",
		"stylers": [{ "lightness": "-11" }]
	}, {
		"featureType": "administrative.locality",
		"elementType": "labels.text",
		"stylers": [{ "color": "#e37f00" }]
	}, {
		"featureType": "administrative.land_parcel",
		"elementType": "all",
		"stylers": [{ "visibility": "on" }]
	}, {
		"featureType": "landscape",
		"elementType": "geometry",
		"stylers": [{ "color": "#000000" }, { "lightness": 20 }]
	}, {
		"featureType": "poi",
		"elementType": "geometry",
		"stylers": [{ "color": "#000000" }, { "lightness": 21 }]
	}, {
		"featureType": "poi.park",
		"elementType": "all",
		"stylers": [{ "visibility": "off" }]
	}, {
		"featureType": "poi.park",
		"elementType": "geometry.stroke",
		"stylers": [{ "visibility": "off" }]
	}, {
		"featureType": "poi.park",
		"elementType": "labels.text.stroke",
		"stylers": [{ "visibility": "simplified" }]
	}, {
		"featureType": "poi.park",
		"elementType": "labels.icon",
		"stylers": [{ "visibility": "off" }]
	}, {
		"featureType": "road",
		"elementType": "all",
		"stylers": [{ "visibility": "simplified" }]
	}, {
		"featureType": "road",
		"elementType": "labels.icon",
		"stylers": [{ "visibility": "off" }]
	}, {
		"featureType": "road.highway",
		"elementType": "geometry.fill",
		"stylers": [{ "color": "#475058" }, { "lightness": "-48" }, { "saturation": "-73" }, { "weight": "3.98" }]
	}, {
		"featureType": "road.highway",
		"elementType": "geometry.stroke",
		"stylers": [{ "color": "#000000" }, { "lightness": 29 }, { "weight": 0.2 }]
	}, {
		"featureType": "road.arterial",
		"elementType": "geometry",
		"stylers": [{ "color": "#000000" }, { "lightness": 18 }]
	}, {
		"featureType": "road.arterial",
		"elementType": "geometry.fill",
		"stylers": [{ "lightness": "7" }]
	}, {
		"featureType": "road.arterial",
		"elementType": "labels.text.fill",
		"stylers": [{ "lightness": "63" }]
	}, {
		"featureType": "road.local",
		"elementType": "geometry",
		"stylers": [{ "color": "#000000" }, { "lightness": 16 }, { "visibility": "off" }]
	}, {
		"featureType": "road.local",
		"elementType": "geometry.fill",
		"stylers": [{ "visibility": "on" }, { "lightness": "-8" }, { "gamma": "1.73" }]
	}, {
		"featureType": "road.local",
		"elementType": "geometry.stroke",
		"stylers": [{ "lightness": "-1" }]
	}, {
		"featureType": "road.local",
		"elementType": "labels.text.fill",
		"stylers": [{ "lightness": "24" }]
	}, {
		"featureType": "transit",
		"elementType": "all",
		"stylers": [{ "visibility": "off" }]
	}, {
		"featureType": "transit",
		"elementType": "geometry",
		"stylers": [{ "color": "#000000" }, { "lightness": 19 }]
	}, {
		"featureType": "water",
		"elementType": "geometry",
		"stylers": [{ "color": "#475058" }, { "lightness": 17 }]
	}, {
		"featureType": "water",
		"elementType": "geometry.fill",
		"stylers": [{ "color": "#d1e0e9" }, { "lightness": "-70" }, { "saturation": "-75" }]
	}, {
		"featureType": "water",
		"elementType": "geometry.stroke",
		"stylers": [{ "visibility": "off" }]
	}, {
		"featureType": "water",
		"elementType": "labels.text.fill",
		"stylers": [{ "lightness": "-54" }, { "hue": "#ff0000" }]
	}], //[{"featureType":"all","elementType":"all","stylers":[{"hue":"#ff0000"},{"saturation":-100},{"lightness":"-34"}]},{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ece204"},{"saturation":"100"},{"weight":"10.00"},{"gamma":"4.40"},{"lightness":"22"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#353535"},{"weight":"2.21"}]},{"featureType":"administrative.locality","elementType":"all","stylers":[{"visibility":"on"},{"color":"#ef950a"},{"weight":"0.32"},{"saturation":"36"},{"lightness":"11"},{"gamma":"1.01"}]},{"featureType":"administrative.neighborhood","elementType":"all","stylers":[{"visibility":"on"},{"hue":"#ffcd00"},{"saturation":"100"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#656565"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#505050"}]},{"featureType":"poi","elementType":"geometry.stroke","stylers":[{"color":"#808080"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#454545"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"off"},{"color":"#b4b87a"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#9d9a65"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#68624b"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#403f3b"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#5f5e5a"}]}],
	[C.MAP_STYLES.NEON]: [{
		"featureType": "all",
		"elementType": "all",
		"stylers": [{ "invert_lightness": true }, { "saturation": 20 }, { "lightness": 50 }, { "gamma": 0.4 }, { "hue": "#00ffee" }]
	}, {
		"featureType": "all",
		"elementType": "geometry",
		"stylers": [{ "visibility": "simplified" }]
	}, {
		"featureType": "all",
		"elementType": "labels",
		"stylers": [{ "visibility": "on" }]
	}, {
		"featureType": "administrative",
		"elementType": "all",
		"stylers": [{ "color": "#ffffff" }, { "visibility": "simplified" }]
	}, {
		"featureType": "administrative.land_parcel",
		"elementType": "geometry.stroke",
		"stylers": [{ "visibility": "simplified" }]
	}, {
		"featureType": "landscape",
		"elementType": "all",
		"stylers": [{ "color": "#405769" }]
	}, { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#232f3a" }] }],
	[C.MAP_STYLES.OLD_STYLE]: [{
		"featureType": "all",
		"elementType": "labels.text.fill",
		"stylers": [{ "saturation": "-100" }]
	}, {
		"featureType": "administrative.neighborhood",
		"elementType": "geometry.fill",
		"stylers": [{ "color": "#ff0000" }]
	}, {
		"featureType": "administrative.land_parcel",
		"elementType": "geometry.fill",
		"stylers": [{ "color": "#bfc6a5" }]
	}, {
		"featureType": "landscape.man_made",
		"elementType": "geometry.fill",
		"stylers": [{ "color": "#e4e4e4" }, { "lightness": "0" }]
	}, {
		"featureType": "landscape.natural",
		"elementType": "geometry.fill",
		"stylers": [{ "color": "#bfc6a5" }, { "visibility": "on" }]
	}, {
		"featureType": "poi",
		"elementType": "geometry.fill",
		"stylers": [{ "color": "#e4d7c6" }]
	}, {
		"featureType": "poi.attraction",
		"elementType": "geometry.fill",
		"stylers": [{ "color": "#e4d7c6" }]
	}, {
		"featureType": "poi.attraction",
		"elementType": "labels.icon",
		"stylers": [{ "visibility": "off" }]
	}, {
		"featureType": "poi.business",
		"elementType": "geometry.fill",
		"stylers": [{ "color": "#e4d7c6" }]
	}, {
		"featureType": "poi.business",
		"elementType": "labels.icon",
		"stylers": [{ "visibility": "off" }]
	}, {
		"featureType": "poi.government",
		"elementType": "geometry.fill",
		"stylers": [{ "color": "#e4d7c6" }]
	}, {
		"featureType": "poi.government",
		"elementType": "labels.icon",
		"stylers": [{ "visibility": "off" }]
	}, {
		"featureType": "poi.medical",
		"elementType": "geometry.fill",
		"stylers": [{ "color": "#e4d7c6" }]
	}, {
		"featureType": "poi.medical",
		"elementType": "labels.icon",
		"stylers": [{ "visibility": "off" }]
	}, {
		"featureType": "poi.park",
		"elementType": "geometry.fill",
		"stylers": [{ "color": "#bfc6a5" }]
	}, {
		"featureType": "poi.park",
		"elementType": "labels.icon",
		"stylers": [{ "visibility": "off" }]
	}, {
		"featureType": "poi.place_of_worship",
		"elementType": "labels.icon",
		"stylers": [{ "visibility": "off" }]
	}, {
		"featureType": "poi.school",
		"elementType": "geometry",
		"stylers": [{ "color": "#e4d7c6" }]
	}, {
		"featureType": "poi.school",
		"elementType": "labels.icon",
		"stylers": [{ "visibility": "off" }]
	}, {
		"featureType": "poi.sports_complex",
		"elementType": "geometry",
		"stylers": [{ "color": "#e4d7c6" }]
	}, {
		"featureType": "poi.sports_complex",
		"elementType": "labels.icon",
		"stylers": [{ "visibility": "off" }]
	}, {
		"featureType": "road",
		"elementType": "geometry.fill",
		"stylers": [{ "color": "#ffffff" }]
	}, {
		"featureType": "road",
		"elementType": "geometry.stroke",
		"stylers": [{ "weight": "0.33" }, { "visibility": "on" }, { "color": "#333333" }]
	}, {
		"featureType": "road",
		"elementType": "labels.icon",
		"stylers": [{ "visibility": "off" }, { "hue": "#ff0000" }]
	}, {
		"featureType": "transit",
		"elementType": "geometry",
		"stylers": [{ "visibility": "off" }]
	}, {
		"featureType": "transit",
		"elementType": "labels",
		"stylers": [{ "visibility": "off" }]
	}, { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#ced6d7" }] }],
	[C.MAP_STYLES.AQUA]: [{
		"featureType": "administrative",
		"elementType": "labels.text.fill",
		"stylers": [{ "color": "#6195a0" }]
	}, {
		"featureType": "landscape",
		"elementType": "all",
		"stylers": [{ "color": "#f2f2f2" }]
	}, {
		"featureType": "landscape",
		"elementType": "geometry.fill",
		"stylers": [{ "color": "#f6fafe" }]
	}, {
		"featureType": "poi",
		"elementType": "all",
		"stylers": [{ "visibility": "off" }]
	}, {
		"featureType": "poi.park",
		"elementType": "geometry.fill",
		"stylers": [{ "color": "#c0e98e" }, { "visibility": "on" }]
	}, {
		"featureType": "road",
		"elementType": "all",
		"stylers": [{ "saturation": -100 }, { "lightness": 45 }, { "visibility": "simplified" }]
	}, {
		"featureType": "road.highway",
		"elementType": "all",
		"stylers": [{ "visibility": "simplified" }]
	}, {
		"featureType": "road.highway",
		"elementType": "geometry.fill",
		"stylers": [{ "color": "#b5d4f5" }, { "visibility": "simplified" }, { "lightness": "0" }, { "saturation": "0" }]
	}, {
		"featureType": "road.highway",
		"elementType": "labels.text",
		"stylers": [{ "color": "#62869f" }]
	}, {
		"featureType": "road.arterial",
		"elementType": "geometry.fill",
		"stylers": [{ "color": "#e5f3fc" }]
	}, {
		"featureType": "road.arterial",
		"elementType": "labels.text.fill",
		"stylers": [{ "color": "#787878" }]
	}, {
		"featureType": "road.arterial",
		"elementType": "labels.icon",
		"stylers": [{ "visibility": "off" }, { "hue": "#00ff97" }]
	}, {
		"featureType": "transit",
		"elementType": "all",
		"stylers": [{ "visibility": "off" }]
	}, {
		"featureType": "water",
		"elementType": "all",
		"stylers": [{ "color": "#eaf6f8" }, { "visibility": "on" }]
	}, { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#d4f3f8" }] }]
};


export class Map extends React.Component {
	constructor(props) {
		super(props);
		this.onMapBoundsChange = this.onMapBoundsChange.bind(this);
		this.getBirdSightingsInfoWindow = this.getBirdSightingsInfoWindow.bind(this);
		this.getNotableSightingsInfoWindow = this.getNotableSightingsInfoWindow.bind(this);
	}

	componentDidMount() {
		const { mapTypeId, mapStyle, intl, dispatch } = this.props;

		google.maps.visualRefresh = true;
		var defaultMapOptions = {
			mapTypeId: mapTypeId,
			center: new google.maps.LatLng(this.props.lat, this.props.lng),
			disableDefaultUI: true,
			zoom: 3,
			streetViewControl: false,
			styles: styles[mapStyle],
			zoomControl: true,
			zoomControlOptions: {
				position: google.maps.ControlPosition.RIGHT_BOTTOM
			}
		};

		_map = new google.maps.Map(ReactDOM.findDOMNode(this), defaultMapOptions);
		this.addEventHandlers();

		const customControlsVisible = mapStyle === C.MAP_STYLES.DEFAULT;
		addCustomControls(mapTypeId, customControlsVisible, intl, dispatch);

		// precache all marker images
		Object.keys(_icons).forEach((key) => {
			const item = _icons[key];

			var img = new Image();
			img.src = item.url;
		});
	}

	shouldComponentUpdate(nextProps) {
		let isNewSearch = false;

		if (this.props.locale !== nextProps.locale) {
			return true;
		}


		if (this.props.resetSearchCounter !== nextProps.resetSearchCounter) {
			isNewSearch = true;
			this.clearMarkers();
			_suppressBoundaryChangeUpdate = true;
		}

		if (this.props.mapStyle !== nextProps.mapStyle) {
			updateCustomControlVisibility(nextProps.mapStyle);
			_map.setOptions({ styles: styles[nextProps.mapStyle] });
		}

		// map updates are explicitly throttled by incrementing mapSettings.searchUpdateCounter
		if (this.props.searchUpdateCounter === nextProps.searchUpdateCounter) {
			return false;
		}

		_currentSearchType = nextProps.searchSettings.searchType;
		this.applyLocationFilter(nextProps);

		if (isNewSearch || (this.props.lat !== nextProps.lat || this.props.lng !== nextProps.lng) &&
		(helpers.isNumeric(nextProps.lat) && helpers.isNumeric(nextProps.lng))) {
			_map.setCenter({
				lat: nextProps.lat,
				lng: nextProps.lng
			});
			_addSearchRangeIndicator();
		}

		if (isNewSearch) {
			if (nextProps.searchSettings.zoomHandling === C.SEARCH_SETTINGS.ZOOM_HANDLING.AUTO_ZOOM) {
				if (nextProps.bounds !== null) {
					_map.fitBounds({
						north: nextProps.bounds.north,
						south: nextProps.bounds.south,
						east: nextProps.bounds.east,
						west: nextProps.bounds.west
					});
				}
			} else {
				_map.setZoom(_data[_currentSearchType].defaultZoomLevel);
			}
		}

		let numLocationsChanged = this.props.results.allLocations.length !== nextProps.results.allLocations.length;
		let windowResized = this.props.env.width !== nextProps.env.width || this.props.env.height !== nextProps.env.height;
		if (numLocationsChanged || windowResized) {
			this.updateMapMarkers(nextProps.searchSettings.searchType, nextProps.results.allLocations, nextProps.results.locationSightings, true);
		}

		if (_currentSearchType === C.SEARCH_SETTINGS.SEARCH_TYPES.ALL) {
			this.setMarkerColours(nextProps);
		} else {
			this.setNotableMarkerColours(nextProps);
		}

		// never update the map with React - it's way too slow
		return false;
	}

	componentDidUpdate(prevProps) {
		if (prevProps.locale !== this.props.locale) {
			const { mapTypeId, mapStyle, intl, dispatch } = this.props;
			const customControlsVisible = mapStyle === C.MAP_STYLES.DEFAULT;
			updateMapButtonsLocale(mapTypeId, customControlsVisible, intl, dispatch);
		}
	}

	setMarkerColours(nextProps) {
		nextProps.results.visibleLocations.forEach((locInfo) => {
			var locId = locInfo.i;
			var locationSightings = nextProps.results.locationSightings[locId].data;

			var numSpecies = 0;
			if (nextProps.results.locationSightings[locId].fetched) {
				numSpecies = locationSightings[nextProps.searchSettings.observationRecency - 1].runningTotal;
			}

			if (numSpecies < 10) {
				_data[_currentSearchType].markers[locId].marker.setIcon(_icons.range1);
			} else if (numSpecies < 20) {
				_data[_currentSearchType].markers[locId].marker.setIcon(_icons.range2);
			} else if (numSpecies < 30) {
				_data[_currentSearchType].markers[locId].marker.setIcon(_icons.range3);
			} else if (numSpecies < 40) {
				_data[_currentSearchType].markers[locId].marker.setIcon(_icons.range4);
			} else if (numSpecies < 50) {
				_data[_currentSearchType].markers[locId].marker.setIcon(_icons.range5);
			} else if (numSpecies < 60) {
				_data[_currentSearchType].markers[locId].marker.setIcon(_icons.range6);
			} else if (numSpecies < 70) {
				_data[_currentSearchType].markers[locId].marker.setIcon(_icons.range7);
			} else {
				_data[_currentSearchType].markers[locId].marker.setIcon(_icons.range8);
			}
		}, this);
	}

	setNotableMarkerColours(nextProps) {
		nextProps.results.visibleLocations.forEach((locInfo) => {
			_data[_currentSearchType].markers[locInfo.i].marker.setIcon(_icons.notable);
		});
	}

	// called any time the map bounds change: onload, zoom, drag. This ensures the appropriate markers are shown.
	updateMapMarkers(searchType, locations, locationSightings, zoomOutToShowResults = false) {
		var mapBoundary = _map.getBounds();
		var boundsObj = new google.maps.LatLngBounds(mapBoundary.getSouthWest(), mapBoundary.getNorthEast());
		var locationsInBounds = [];
		let locationIDsInBounds = [];
		let latLngList = [];

		locations.forEach((locInfo) => {
			let lat = locInfo.la;
			let lng = locInfo.lg;
			latLngList.push([lat, lng]);

			var latlng = new google.maps.LatLng(lat, lng);
			var locId = locInfo.i;

			// filter out-of-bounds markers
			if (!boundsObj.contains(latlng)) {
				if (_data[_currentSearchType].markers.hasOwnProperty(locId)) {
					_data[_currentSearchType].markers[locId].marker.setMap(null);
				}
				return;
			}

			if (_data[_currentSearchType].markers.hasOwnProperty(locId)) {
				this.showMarkerWithFilter(locInfo);
			} else {
				if (searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.ALL) {
					this.addBirdMarker(locId, latlng, locInfo);
				} else {
					this.addNotableMarker(searchType, locId, latlng, locInfo);
				}
			}

			locationsInBounds.push(locInfo);
			locationIDsInBounds.push(locInfo.i);
		});

		// for new searches, the default search zoom level may not show any results. We know there are results so we zoom
		// out as far as needed to show the first result
		if (zoomOutToShowResults && locations.length > 0 && locationsInBounds.length === 0) {
			let center = _map.getCenter();
			const closestResult = helpers.findClosestLatLng(center.lat(), center.lng(), latLngList);
			const closestLatLng = new google.maps.LatLng(parseFloat(closestResult.lat), parseFloat(closestResult.lng));

			var bounds = new google.maps.LatLngBounds();
			bounds.extend(center);
			bounds.extend(closestLatLng);
			_map.fitBounds(bounds);

			return this.updateMapMarkers(searchType, locations, locationSightings);
		}

		const newSorted = locationIDsInBounds.sort();

		// if the list of hotspots in the map boundary changed, publish the info
		if (!_.isEqual(newSorted, _currentHotspotIDsInMapBoundaries)) {
			this.props.dispatch(actions.visibleLocationsFound(searchType, locationsInBounds, locationSightings));
		}

		_currentHotspotIDsInMapBoundaries = newSorted;
	}

	clearMarkers() {
		// remove the markers from the map, then delete them in memory
		for (let locationID in _data[C.SEARCH_SETTINGS.SEARCH_TYPES.ALL].markers) {
			_data[C.SEARCH_SETTINGS.SEARCH_TYPES.ALL].markers[locationID].marker.setMap(null);
		}
		for (let locationID in _data[C.SEARCH_SETTINGS.SEARCH_TYPES.NOTABLE].markers) {
			_data[C.SEARCH_SETTINGS.SEARCH_TYPES.NOTABLE].markers[locationID].marker.setMap(null);
		}
		_data[C.SEARCH_SETTINGS.SEARCH_TYPES.ALL].markers = {};
		_data[C.SEARCH_SETTINGS.SEARCH_TYPES.NOTABLE].markers = {};
	}

	onMapBoundsChange() {
		const { results, searchSettings } = this.props;

		// urgh. When a second search gets passed, any change in lat/lng or zoom trigger onMapBoundsChange. Thing is,
		// we don't want to update the markers here - we let shouldComponentUpdate() handle it. Otherwise the map ends up
		// showing deleted markers
		if (!_suppressBoundaryChangeUpdate) {
			this.updateMapMarkers(searchSettings.searchType, results.allLocations, results.locationSightings);
		}

		// we can immediately set it back
		_suppressBoundaryChangeUpdate = false;
	}

	addEventHandlers() {
		const dispatch = this.props.dispatch;

		$(document).on('click', '.viewLocationSightingDetails', (e) => {
			e.preventDefault();
			dispatch(actions.selectLocation($(e.target).data('locationId')));
			dispatch(actions.showSightingsPanel());
		});

		// called any time the map has had its bounds changed
		google.maps.event.addListener(_map, 'dragend', this.onMapBoundsChange);
		google.maps.event.addListener(_map, 'zoom_changed', this.onMapBoundsChange);
	}

	applyLocationFilter(nextProps) {
		const { locationFilter } = this.props;

		// if the location filter just changed, update the list of hidden/visible markers
		if (locationFilter !== nextProps.locationFilter) {
			var regexp = new RegExp(nextProps.locationFilter, 'i');
			nextProps.results.visibleLocations.forEach((locInfo) => {
				if (regexp.test(locInfo.n)) {
					if (!_data[_currentSearchType].markers[locInfo.i].visible) {
						_data[_currentSearchType].markers[locInfo.i].visible = true;
						_data[_currentSearchType].markers[locInfo.i].marker.setMap(_map);
					}
				} else {
					_data[_currentSearchType].markers[locInfo.i].visible = false;
					_data[_currentSearchType].markers[locInfo.i].marker.setMap(null);
				}
			});
		}
	}

	// adds a marker, taking into account whether a filter is applied
	showMarkerWithFilter(locInfo) {
		const { locationFilter } = this.props;
		let show = true;
		if (locationFilter !== '') {
			var regexp = new RegExp(locationFilter, 'i'); // hmm... this runs for EVERY marker
			show = regexp.test(locInfo.n);
		}
		if (show) {
			_data[_currentSearchType].markers[locInfo.i].marker.setMap(_map);
		}
	}

	addBirdMarker(locationID, latlng, currMarkerInfo) {
		const { intl } = this.props;

		if (_data[_currentSearchType].markers.hasOwnProperty(locationID)) {
			if (_data[_currentSearchType].markers[locationID].marker.map === null) {
				_data[_currentSearchType].markers[locationID].marker.setMap(_map);
			}
			return;
		}

		_data[_currentSearchType].markers[locationID] = {
			visible: false,
			marker: new google.maps.Marker({
				position: latlng,
				map: _map,
				title: currMarkerInfo.n,
				icon: _icons.range1,
				locationID: locationID
			})
		};

		initInfoWindow();
		let getInfoWindow = this.getBirdSightingsInfoWindow;
		((marker, locInfo) => {
			google.maps.event.addListener(marker, 'click', function () {
				_infoWindow.setContent(ReactDOMServer.renderToString(getInfoWindow(locInfo, intl)));
				_infoWindow.open(_map, this);
			});
		})(_data[_currentSearchType].markers[locationID].marker, currMarkerInfo);
	};

	addNotableMarker(searchType, locationID, latlng, currMarkerInfo) {
		const { intl } = this.props;

		if (_data[_currentSearchType].markers.hasOwnProperty(locationID)) {
			if (_data[_currentSearchType].markers[locationID].marker.map === null) {
				_data[_currentSearchType].markers[locationID].marker.setMap(_map);
			}
			return;
		}

		_data[_currentSearchType].markers[locationID] = {
			visible: false,
			marker: new google.maps.Marker({
				position: latlng,
				map: _map,
				title: currMarkerInfo.n,
				icon: (searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.ALL) ? _icons.range1 : _icons.notable,
				locationID: locationID
			})
		};

		initInfoWindow();
		let getInfoWindow = this.getNotableSightingsInfoWindow;
		((marker, locInfo) => {
			google.maps.event.addListener(marker, 'click', function () {
				const l10n = {
					viewChecklist: intl.formatMessage({ id: 'viewChecklist' }),
					viewFullInfo: intl.formatMessage({ id: 'viewFullInfo' })
				};
				_infoWindow.setContent(ReactDOMServer.renderToString(getInfoWindow(locInfo, l10n)));
				_infoWindow.open(_map, this);
			});
		})(_data[_currentSearchType].markers[locationID].marker, currMarkerInfo);
	}

	getBirdSightingsInfoWindow(locInfo, intl) {
		const { results, searchSettings } = this.props;
		var locationSightings = results.locationSightings[locInfo.i].data;
		const obsRecency = searchSettings.observationRecency;
		var numSpecies = 0;
		if (results.locationSightings[locInfo.i].fetched) {
			numSpecies = locationSightings[obsRecency - 1].runningTotal;
		}

		// this is a hack to get around react-intl not being able to be used in this context. God I dislike react-intl. You
		// can't seem to pass DOM nodes into formatMessage so I can't embolden the params. But I can't use <FormattedMessage />
		// in this context either, so I either hack it even more or accept that I'm pooched
		const linkText = intl.formatMessage({ id: 'numSightingsAtLocation' }, {
			numSpecies: numSpecies,
			obsRecency: obsRecency
		});

		return (
		<div className="marker-popup">
			<h4>{locInfo.n}</h4>
			<a href="#" className="viewLocationSightingDetails" data-location-id={locInfo.i}>{linkText}</a>
		</div>
		);
	};

	getNotableSightingsInfoWindow(locInfo, l10n) {
		const { results, searchSettings } = this.props;
		var locationSightings = results.locationSightings[locInfo.i].data;
		const obsRecency = searchSettings.observationRecency;

		const sightings = [];
		for (var i = 0; i < obsRecency; i++) {
			for (var j = 0; j < locationSightings[i].obs.length; j++) {
				sightings.push(locationSightings[i].obs[j]);
			}
		}

		return (
		<div className="marker-popup">
			<h4>{locInfo.n}</h4>

			<div className="notable-sightings-list-wrapper">
				<table className="notable-sightings-list">
					<tbody>
					{this.getNotableRows(sightings, l10n)}
					</tbody>
				</table>
			</div>
			<a href="#" className="viewLocationSightingDetails" data-location-id={locInfo.i}>{l10n.viewFullInfo}</a>
		</div>
		);
	}

	getNotableRows(sightings, l10n) {
		return sightings.map((sighting) => {
			const checklistLink = `http://ebird.org/ebird/view/checklist/${sighting.subID}`;
			const sightingDate = moment(sighting.obsDt, 'YYYY-MM-DD HH:mm').format('MMM Do, H:mm a');
			return (
				<tr key={sighting.obsID}>
					<td className="species-name">{sighting.comName}</td>
					<td className="obs-date">{sightingDate}</td>
					<td>
						<a href={checklistLink} target="_blank" className="checklist-link glyphicon glyphicon-list"
						   title={l10n.viewChecklist}/>
					</td>
				</tr>
			);
		});
	}

	render() {
		return (
			<div className="flex-body"></div>
		);
	}
}
Map.PropTypes = {
	results: React.PropTypes.array.isRequired,
	locationFilter: React.PropTypes.string.isRequired
};


var _addSearchRangeIndicator = () => {
	// lame, but setting the map to null doesn't work, so keep adding more & hiding the previous
	if (_circleOverlayIndex > 0) {
		_circleOverlays[_circleOverlayIndex - 1].set("visible", false);
	}

	_circleOverlays[_circleOverlayIndex] = new InvertedCircle({
		center: _map.getCenter(),
		map: _map,
		radius: _data[_currentSearchType].circleRadius,
		editable: false,
		stroke_weight: 0,
		always_fit_to_map: false
	});
	_circleOverlayIndex++;
};


var addCustomControls = function (mapTypeId, isVisible, intl, dispatch) {
	const selectedBtnClass = 'map-btn-selected';

	let btn1Classes = 'map-btn map-btn-first' + ((isVisible) ? '' : ' omit');
	if (mapTypeId === google.maps.MapTypeId.TERRAIN) {
		btn1Classes += ' ' + selectedBtnClass;
	}
	const terrain = intl.formatMessage({ id: 'terrain' });
	const btn1 = $(`<div class="${btn1Classes}" id="map-terrain-btn">${terrain}</div>`)[0];

	let btn2Classes = 'map-btn' + ((isVisible) ? '' : ' omit');
	if (mapTypeId === google.maps.MapTypeId.ROADMAP) {
		btn2Classes += ' ' + selectedBtnClass;
	}
	const roadMap = intl.formatMessage({ id: 'roadMap' });
	const btn2 = $(`<div class="${btn2Classes}" id="map-roadmap-btn">${roadMap}</div>`)[0];

	let btn3Classes = 'map-btn' + ((isVisible) ? '' : ' omit');
	if (mapTypeId === google.maps.MapTypeId.SATELLITE) {
		btn3Classes += ' ' + selectedBtnClass;
	}
	const satellite = intl.formatMessage({ id: 'satellite' });
	const btn3 = $(`<div class="${btn3Classes}" id="map-satellite-btn">${satellite}</div>`)[0];

	let btn4Classes = 'map-btn map-btn-last' + ((isVisible) ? '' : ' omit');
	if (mapTypeId === google.maps.MapTypeId.HYBRID) {
		btn4Classes += ' ' + selectedBtnClass;
	}
	const hybrid = intl.formatMessage({ id: 'hybrid' });
	const btn4 = $(`<div class="${btn4Classes}" id="map-hybrid-btn">${hybrid}</div>`)[0];

	// add the controls to the map
	_map.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn4);
	_map.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn3);
	_map.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn2);
	_map.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn1);

	const mapBtnClass = '.map-btn';

	// add the appropriate event handlers
	google.maps.event.addDomListener(btn1, 'click', (e) => {
		if ($(e.target).hasClass('omit')) {
			return;
		}
		_map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
		$(mapBtnClass).removeClass(selectedBtnClass);
		$(btn1).addClass(selectedBtnClass);
		dispatch(actions.setMapTypeId(google.maps.MapTypeId.TERRAIN));
	});
	google.maps.event.addDomListener(btn2, 'click', (e) => {
		if ($(e.target).hasClass('omit')) {
			return;
		}
		_map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
		$(mapBtnClass).removeClass(selectedBtnClass);
		$(btn2).addClass(selectedBtnClass);
		dispatch(actions.setMapTypeId(google.maps.MapTypeId.ROADMAP));
	});
	google.maps.event.addDomListener(btn3, 'click', (e) => {
		if ($(e.target).hasClass('omit')) {
			return;
		}
		_map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
		$(mapBtnClass).removeClass(selectedBtnClass);
		$(btn3).addClass(selectedBtnClass);
		dispatch(actions.setMapTypeId(google.maps.MapTypeId.SATELLITE));
	});
	google.maps.event.addDomListener(btn4, 'click', (e) => {
		if ($(e.target).hasClass('omit')) {
			return;
		}
		_map.setMapTypeId(google.maps.MapTypeId.HYBRID);
		$(mapBtnClass).removeClass(selectedBtnClass);
		$(btn4).addClass(selectedBtnClass);
		dispatch(actions.setMapTypeId(google.maps.MapTypeId.HYBRID));
	});
};

const updateMapButtonsLocale = (mapTypeId, isVisible, intl, dispatch) => {
	_map.controls[google.maps.ControlPosition.TOP_RIGHT].clear();
	addCustomControls(mapTypeId, isVisible, intl, dispatch);
};


const initInfoWindow = () => {
	if (_infoWindow) {
		_infoWindow.close();
	}
	_infoWindow = new google.maps.InfoWindow();
};

const updateCustomControlVisibility = (mapStyle) => {
	if (mapStyle === C.MAP_STYLES.DEFAULT) {
		showCustomControls();
	} else {
		hideCustomControls();
	}
};

const hideCustomControls = () => {
	$('.map-btn').addClass('omit');
};

const showCustomControls = () => {
	$('.map-btn').removeClass('omit');
};
