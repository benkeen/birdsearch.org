import React from 'react';
import ReactDOM from 'react-dom';

var _icon = "images/marker.png";

// stores all map-related data, grouped by search type
var _map;
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
var _visibleHotspots = [];


/**
 * Adds hotspots to the map for any of the three search types: all, notable, hotspots. The first
 * param specifies the search type; the second is a standardized array of hotspot data. Format:
 *   {
 *		i: ...
 *		lat: ...
 *		lng: ...
 *		n: ... (location name)
 *   }
 * The objects can contain any additional info needed; they're just ignored.
 */
var addMarkers = function (allLocations) {
  var mapBoundary = _map.getBounds();
  var boundsObj = new google.maps.LatLngBounds(mapBoundary.getSouthWest(), mapBoundary.getNorthEast());
  _visibleHotspots = [];

  allLocations.forEach(function (locInfo) {
    var latlng = new google.maps.LatLng(locInfo.la, locInfo.lg);
    if (!boundsObj.contains(latlng)) {
      return;
    }
//      if (this.props.searchType === "all") {
    addBirdMarker(locInfo.i, latlng, locInfo);
    //    }
    _visibleHotspots.push(locInfo);
  });

  //if (searchType === "all") {
  //  _addBirdMarker(locationID, latlng, currMarkerInfo);
  //} else if (searchType === "notable") {
  //  _addNotableMarker(locationID, latlng, currMarkerInfo);
  //} else if (searchType === "hotspots") {
  //  _addHotspotMarker(locationID, latlng, currMarkerInfo);
  //}
};

var addBirdMarker = function (locationID, latlng, currMarkerInfo) {
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
        //infoWindow.setContent(_getBirdSightingInfoWindow(locInfo));
        //infoWindow.open(_map, this);
      });
    })(_data.all.markers[locationID], _data.all.infoWindows[locationID], currMarkerInfo);
  }
};


class Map extends React.Component {

  componentDidMount () {
    google.maps.visualRefresh = true;
    var defaultMapOptions = {

      // customizable
      zoom: this.props.zoom,
      mapTypeId: this.props.mapTypeId,
      center: new google.maps.LatLng(this.props.lat, this.props.lng),

      // not customizable
      mapTypeControlOptions: { mapTypeIds: [] },
      streetViewControl: false,
      disableDefaultUI: true,
      panControl: true,
      zoomControl: true,
      scaleControl: true,
      overviewMapControl: true
    };

    _map = new google.maps.Map(ReactDOM.findDOMNode(this), defaultMapOptions);
    this.addCustomControls();
    this.addEventHandlers();
  }

  componentDidUpdate (prevProps) {
    if (prevProps.zoom !== this.props.zoom) {
      _map.setZoom(this.props.zoom);
    }

    _map.setCenter({
      lat: this.props.lat,
      lng: this.props.lng
    });

    if (this.props.bounds !== null) {
      _map.fitBounds({
        north: this.props.bounds.north,
        south: this.props.bounds.south,
        east: this.props.bounds.east,
        west: this.props.bounds.west
      });
    }

    // TODO this won't always work
    if (this.props.results.allLocations.length !== prevProps.results.allLocations.length) {
      //this.clearHotspots();
      addMarkers(this.props.results.allLocations);
  //    _addMarkers("all", _data.all.lastSearch);
    }
  }

  clearHotspots () {
    //for (var locationID in _data.all.markers) {
    //  _data.all.markers[locationID].setMap(null);
    //}
    //for (var locationID in _data.notable.markers) {
    //  _data.notable.markers[locationID].setMap(null);
    //}
    //for (var locationID in _data.hotspots.markers) {
    //  _data.hotspots.markers[locationID].setMap(null);
    //}
  }



  addCustomControls () {
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
    google.maps.event.addDomListener(btn1, 'click', function () {
      _map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
      $(".mapBtn").removeClass('mapBtnSelected');
      $(btn1).addClass('mapBtnSelected');
    });
    google.maps.event.addDomListener(btn2, 'click', function () {
      _map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
      $(".mapBtn").removeClass('mapBtnSelected');
      $(btn2).addClass('mapBtnSelected');
    });
    google.maps.event.addDomListener(btn3, 'click', function () {
      _map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
      $(".mapBtn").removeClass('mapBtnSelected');
      $(btn3).addClass('mapBtnSelected');
    });
    google.maps.event.addDomListener(btn4, 'click', function () {
      _map.setMapTypeId(google.maps.MapTypeId.HYBRID);
      $(".mapBtn").removeClass('mapBtnSelected');
      $(btn4).addClass('mapBtnSelected');
    });
  };

  addEventHandlers () {
    //$(document).on("click", ".viewNotableSightingDetails", _onClickViewFullNotableDetails);
    //$(document).on("click", ".viewLocationSightingDetails", _onClickViewLocationSightings);
  }

  //var _onAutoComplete = function() {
  //  var currPlace = _autoComplete.getPlace();
  //
  //  if (!currPlace.geometry) {
  //    return;
  //  }
  //  _viewportObj = currPlace.geometry.hasOwnProperty("viewport") ? currPlace.geometry.viewport : null;
  //  _locationObj = currPlace.geometry.location;
  //
  //  // keep track of the specificity of the last search. Depending on the search type (all, notable, hotspots)
  //  // it may not be valid
  //  _lastSearchNumAddressComponents = null;
  //  if (_locationField[0].value !== '' && currPlace !== null) {
  //    _lastSearchNumAddressComponents = currPlace.address_components.length;
  //  }
  //};

  render () {
    //// called any time the map has had its bounds changed
    //google.maps.event.addListener(_map, "dragend", _onMapBoundsChange);
    //google.maps.event.addListener(_map, "zoom_changed", _onMapBoundsChange);
    //
    //mediator.publish(_MODULE_ID, C.EVENT.TRIGGER_WINDOW_RESIZE);

    return (
      <div className="flex-body"></div>
    );
  }
}
Map.PropTypes = {
  results: React.PropTypes.array.isRequired
};

export default Map;
