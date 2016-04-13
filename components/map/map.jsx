import React from 'react';
import ReactDOM from 'react-dom';
import { _, actions, helpers } from '../../core/core';


var _icons = {
  range1: {
    url: 'images/markers/white.png',
    scaledSize: new google.maps.Size(21, 26)
  },
  range2: {
    url: 'images/markers/grey.png',
    scaledSize: new google.maps.Size(21, 26)
  },
  range3: {
    url: 'images/markers/sea-blue.png',
    scaledSize: new google.maps.Size(21, 26)
  },
  range4: {
    url: 'images/markers/turquoise.png',
    scaledSize: new google.maps.Size(21, 26)
  },
  range5: {
    url: 'images/markers/green.png',
    scaledSize: new google.maps.Size(21, 26)
  },
  range6: {
    url: 'images/markers/yellow.png',
    scaledSize: new google.maps.Size(21, 26)
  },
  range7: {
    url: 'images/markers/orange.png',
    scaledSize: new google.maps.Size(21, 26)
  },
  range8: {
    url: 'images/markers/red.png',
    scaledSize: new google.maps.Size(21, 26)
  }
};
var _circleOverlays = {};
var _circleOverlayIndex = 0;


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


var addBirdMarker = function (locationID, latlng, currMarkerInfo) {
  if (_.has(_data.all.markers, locationID)) {
    if (_data.all.markers[locationID].map === null) {
      _data.all.markers[locationID].setMap(_map);
    }
    return;
  }

  _data.all.markers[locationID] = new google.maps.Marker({
    position: latlng,
    map: _map,
    title: currMarkerInfo.n,
    icon: _icons.range1,
    locationID: locationID
  });
  _data.all.infoWindows[locationID] = new google.maps.InfoWindow();

  //(function(marker, infoWindow, locInfo) {
  //  google.maps.event.addListener(marker, "click", function() {
  //    //infoWindow.setContent(_getBirdSightingInfoWindow(locInfo));
  //    //infoWindow.open(_map, this);
  //  });
  //})(_data.all.markers[locationID], _data.all.infoWindows[locationID], currMarkerInfo);
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
      overviewMapControl: true,
      styles: [{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},{"featureType":"water","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#C6E2FF"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#C5E3BF"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#D1D1B8"}]}]
    };

    _map = new google.maps.Map(ReactDOM.findDOMNode(this), defaultMapOptions);
    this.addCustomControls();
    this.addEventHandlers();

    // precache all markers
    _.each(_icons, function (key) {
      var img = new Image();
      img.src = key.url;
    });
  }

  shouldComponentUpdate (nextProps, nextState) {

    // map updates are explicitly throttled by incrementing mapSettings.searchCounter
    if (this.props.searchCounter === nextProps.searchCounter) {
      return false;
    }

    if (this.props.locationFilter !== nextProps.locationFilter) {
      //_data.all.markers[locationID]
      //.setVisible(false);
      //console.log("locations: ", helpers.filterLocations(nextProps.locations, nextProps.filter));
    }

    if (nextProps.zoom !== this.props.zoom) {
      _map.setZoom(this.props.zoom);
    }

    if (this.props.lat !== nextProps.lat || this.props.lng !== nextProps.lng) {
      _map.setCenter({
        lat: nextProps.lat,
        lng: nextProps.lng
      });
      _addSearchRangeIndicator();
    }

    if (this.props.bounds === null && nextProps.bounds !== null) {
      _map.fitBounds({
        north: nextProps.bounds.north,
        south: nextProps.bounds.south,
        east: nextProps.bounds.east,
        west: nextProps.bounds.west
      });
    }

    // - window resize
    // - new search
    // - map zoom / drag
    var numLocationsChanged = this.props.results.allLocations.length !== nextProps.results.allLocations.length;
    var windowResized = this.props.env.width !== nextProps.env.width || this.props.env.height !== nextProps.env.height;

    if (numLocationsChanged || windowResized) {
      this.clearHotspots();
      this.addMarkers(nextProps.results.allLocations, nextProps.results.locationSightings);
    }

    // when do we want to clear the hotspots?
    //  - after a new search (different location)
    //  - after the map boundary changes
    //  - ...

    this.showLocations(nextProps);

    // never update the map with React. We do it all internally. It's way too slow otherwise
    return false;
  }

  showLocations (nextProps) {
    _.each(nextProps.results.visibleLocations, function (locInfo) {
      var locId = locInfo.i;
      var locationSightings = nextProps.results.locationSightings[locId].data;

      var numSpecies = 0;
      if (nextProps.results.locationSightings[locId].fetched) {
        numSpecies = locationSightings[nextProps.searchSettings.observationRecency - 1].numSpeciesRunningTotal;
      }

      if (numSpecies < 10) {
        _data.all.markers[locId].setIcon(_icons.range1);
      } else if (numSpecies < 20) {
        _data.all.markers[locId].setIcon(_icons.range2);
      } else if (numSpecies < 30) {
        _data.all.markers[locId].setIcon(_icons.range3);
      } else if (numSpecies < 40) {
        _data.all.markers[locId].setIcon(_icons.range4);
      } else if (numSpecies < 50) {
        _data.all.markers[locId].setIcon(_icons.range5);
      } else if (numSpecies < 60) {
        _data.all.markers[locId].setIcon(_icons.range6);
      } else if (numSpecies < 70) {
        _data.all.markers[locId].setIcon(_icons.range7);
      } else {
        _data.all.markers[locId].setIcon(_icons.range8);
      }
    }, this);
  }

  /**
   * Adds hotspots to the map for any of the three search types: all, notable, hotspots. The first
   * param specifies the search type; the second is a standardized array of hotspot data. Format:
   *   {
   *		 i: ...
   *		 lat: ...
   *		 lng: ...
   *		 n: ... (location name)
   *   }
   * The objects can contain any additional info needed; they're just ignored.
   */
  addMarkers (locations, locationSightings) {
    var mapBoundary = _map.getBounds();
    var boundsObj = new google.maps.LatLngBounds(mapBoundary.getSouthWest(), mapBoundary.getNorthEast());
    var visibleHotspots = [];

    locations.forEach(function (locInfo) {
      var latlng = new google.maps.LatLng(locInfo.la, locInfo.lg);
      var locID = locInfo.i;
      if (!boundsObj.contains(latlng)) {
        if (_.has(_data.all.markers, locID)) {
          _data.all.markers[locID].setMap(null);
        }
        return;
      }

      if (!_.has(_data.all.markers, locID)) {
        addBirdMarker(locID, latlng, locInfo);
      }
      visibleHotspots.push(locInfo);

      //if (searchType === "all") {
      //  _addBirdMarker(locationID, latlng, currMarkerInfo);
      //} else if (searchType === "notable") {
      //  _addNotableMarker(locationID, latlng, currMarkerInfo);
      //} else if (searchType === "hotspots") {
      //  _addHotspotMarker(locationID, latlng, currMarkerInfo);
      //}
    });

    // publish the visible hotspots: LocationsPanel needs to know about it
    this.props.dispatch(actions.visibleLocationsFound(visibleHotspots, locationSightings));
  }

  clearHotspots () {
    for (var locationID in _data.all.markers) {
      _data.all.markers[locationID].setMap(null);
    }
    //for (var locationID in _data.notable.markers) {
    //  _data.notable.markers[locationID].setMap(null);
    //}
    //for (var locationID in _data.hotspots.markers) {
    //  _data.hotspots.markers[locationID].setMap(null);
    //}
  }

  onMapBoundsChange () {
    //this.clearHotspots();
    this.addMarkers(this.props.results.allLocations, this.props.results.locationSightings);
    //this.props.dispatch(actions.visibleLocationsFound(visibleHotspots, locationSightings));
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
    // called any time the map has had its bounds changed
    google.maps.event.addListener(_map, "dragend", this.onMapBoundsChange.bind(this));
    google.maps.event.addListener(_map, "zoom_changed", this.onMapBoundsChange.bind(this));
  }

  render () {
    return (
      <div className="flex-body"></div>
    );
  }
}
Map.PropTypes = {
  results: React.PropTypes.array.isRequired,
  locationFilter: React.PropTypes.string.isRequired
};


var _addSearchRangeIndicator = function () {

  // lame, but setting the map to null doesn't work, so keep adding more & hiding the previous
  if (_circleOverlayIndex > 0) {
    _circleOverlays[_circleOverlayIndex-1].set("visible", false);
  }

  _circleOverlays[_circleOverlayIndex] = new InvertedCircle({
    center: _map.getCenter(),
    map: _map,
    radius: _data['all'].circleRadius,
    editable: false,
    stroke_weight: 0,
    always_fit_to_map: false
  });
  _circleOverlayIndex++;
};


export default Map;
