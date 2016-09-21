import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import { FormattedMessage } from 'react-intl';
import { _, actions, helpers } from '../core/core';


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


var createBirdMarker = function (locationID, latlng, currMarkerInfo) {
  if (_.has(_data.all.markers, locationID)) {
    if (_data.all.markers[locationID].marker.map === null) {
      _data.all.markers[locationID].marker.setMap(_map);
    }
    return;
  }

  _data.all.markers[locationID] = {
    visible: false,
    marker: new google.maps.Marker({
      position: latlng,
      map: _map,
      title: currMarkerInfo.n,
      icon: _icons.range1,
      locationID: locationID
    })
  };
  _data.all.infoWindows[locationID] = new google.maps.InfoWindow();

  (function(marker, infoWindow, locInfo) {
    google.maps.event.addListener(marker, 'click', function() {
      infoWindow.setContent(ReactDOMServer.renderToString(getBirdSightingInfoWindow(locInfo)));
      infoWindow.open(_map, this);
    });
  })(_data.all.markers[locationID].marker, _data.all.infoWindows[locationID], currMarkerInfo);
};


var getBirdSightingInfoWindow = function(locInfo) {
//  var numSightings = locInfo.sightings.data[_lastSearch.observationRecency-1].numSpeciesRunningTotal;
//  var html = _.template(allSightingsInfoWindowTemplate, {
//    L: _L,
//    locationName: locInfo.n,
//    locationID: locInfo.locationID,
//    numSpecies: numSightings
//  });
  console.log(locInfo);

  return (
    <div className="marker-popup">
      <h4>{locInfo.n}</h4>
      <a href="#">N bird species seen in the last N days</a>
    </div>
  );
};


class Map extends React.Component {
  constructor (props) {
    super(props);
    this.onMapBoundsChange = this.onMapBoundsChange.bind(this);
  }

  componentDidMount () {
    google.maps.visualRefresh = true;
    var defaultMapOptions = {

      // customizable
      zoom: this.props.zoom,
      mapTypeId: this.props.mapTypeId,
      center: new google.maps.LatLng(this.props.lat, this.props.lng),

      // not customizable
      //mapTypeControlOptions: { mapTypeIds: [] },
      streetViewControl: false,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_RIGHT
      },
      styles: [{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},{"featureType":"water","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#C6E2FF"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#C5E3BF"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#D1D1B8"}]}]
    };

    _map = new google.maps.Map(ReactDOM.findDOMNode(this), defaultMapOptions);

    //this.addCustomControls();
    this.addEventHandlers();

    // precache all marker images
    _.each(_icons, function (key) {
      var img = new Image();
      img.src = key.url;
    });
  }

  shouldComponentUpdate (nextProps) {

    // map updates are explicitly throttled by incrementing mapSettings.searchCounter
    if (this.props.searchCounter === nextProps.searchCounter) {
      return false;
    }

    if (this.props.locationFilter !== nextProps.locationFilter) {
      var regexp = new RegExp(nextProps.locationFilter, 'i');

      _.each(nextProps.results.visibleLocations, (locInfo) => {
        if (regexp.test(locInfo.n)) {
          if (!_data.all.markers[locInfo.i].visible) {
            _data.all.markers[locInfo.i].visible = true;
            _data.all.markers[locInfo.i].marker.setMap(_map);
          }
        } else {
          _data.all.markers[locInfo.i].visible = false;
          _data.all.markers[locInfo.i].marker.setMap(null);
        }
      });
    }

    if (nextProps.zoom !== this.props.zoom) {
      _map.setZoom(this.props.zoom);
    }

    if ((this.props.lat !== nextProps.lat || this.props.lng !== nextProps.lng) &&
      (_.isNumber(nextProps.lat) && _.isNumber(nextProps.lng))) {
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

    // TODO
    if (numLocationsChanged || windowResized) {
      this.clearHotspots();
      this.addMapMarkers(nextProps.results.allLocations, nextProps.results.locationSightings);
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
        _data.all.markers[locId].marker.setIcon(_icons.range1);
      } else if (numSpecies < 20) {
        _data.all.markers[locId].marker.setIcon(_icons.range2);
      } else if (numSpecies < 30) {
        _data.all.markers[locId].marker.setIcon(_icons.range3);
      } else if (numSpecies < 40) {
        _data.all.markers[locId].marker.setIcon(_icons.range4);
      } else if (numSpecies < 50) {
        _data.all.markers[locId].marker.setIcon(_icons.range5);
      } else if (numSpecies < 60) {
        _data.all.markers[locId].marker.setIcon(_icons.range6);
      } else if (numSpecies < 70) {
        _data.all.markers[locId].marker.setIcon(_icons.range7);
      } else {
        _data.all.markers[locId].marker.setIcon(_icons.range8);
      }
    }, this);
  }

  // called any time the map bounds change: onload, zoom, drag. This ensures the appropriate markers are shown
  // (white if they don't have any
  addMapMarkers (locations, locationSightings) {
    var mapBoundary = _map.getBounds();
    var boundsObj = new google.maps.LatLngBounds(mapBoundary.getSouthWest(), mapBoundary.getNorthEast());
    var visibleHotspots = [];

    locations.forEach(function (locInfo) {
      var latlng = new google.maps.LatLng(locInfo.la, locInfo.lg);
      var locID = locInfo.i;

      // if a marker has already been added to this
      if (!boundsObj.contains(latlng)) {
        if (_.has(_data.all.markers, locID)) {
          _data.all.markers[locID].marker.setMap(null);
        }
        return;
      }

      if (_.has(_data.all.markers, locID)) {
        _data.all.markers[locID].marker.setMap(_map);
      } else {
        createBirdMarker(locID, latlng, locInfo);
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
      _data.all.markers[locationID].marker.setMap(null);
    }

    //for (var locationID in _data.notable.markers) {
    //  _data.notable.markers[locationID].setMap(null);
    //}
    //for (var locationID in _data.hotspots.markers) {
    //  _data.hotspots.markers[locationID].setMap(null);
    //}
  }

  onMapBoundsChange () {
    const { results } = this.props;

    // TODO what if it's a completely fresh search? Need to clear it out...
    //this.clearHotspots();

    this.addMapMarkers(results.allLocations, results.locationSightings);

    //this.props.dispatch(actions.visibleLocationsFound(visibleHotspots, locationSightings));
  }

  addCustomControls () {
    var btn1 = $('<div class="map-btn">Terrain</div>')[0];
    var btn2 = $('<div class="map-btn">Road Map</div>')[0];
    var btn3 = $('<div class="map-btn">Satellite</div>')[0];
    var btn4 = $('<div class="map-btn">Hybrid</div>')[0];

    //mapBtnSelected

    // TODO this is better. https://developers.google.com/maps/documentation/javascript/examples/control-custom

    // add the controls to the map
    _map.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn4);
    _map.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn3);
    _map.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn2);
    _map.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn1);

    // add the appropriate event handlers
    google.maps.event.addDomListener(btn1, 'click', () => {
      _map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
      $(".map-btn").removeClass('map-btn-Selected');
      $(btn1).addClass('map-btn-Selected');
    });
    google.maps.event.addDomListener(btn2, 'click', () => {
      _map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
      $(".map-btn").removeClass('map-btn-Selected');
      $(btn2).addClass('map-btn-Selected');
    });
    google.maps.event.addDomListener(btn3, 'click', () => {
      _map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
      $(".map-btn").removeClass('map-btn-Selected');
      $(btn3).addClass('map-btn-Selected');
    });
    google.maps.event.addDomListener(btn4, 'click', () => {
      _map.setMapTypeId(google.maps.MapTypeId.HYBRID);
      $(".map-btn").removeClass('map-btn-Selected');
      $(btn4).addClass('map-btn-Selected');
    });
  }

  addEventHandlers () {
    //$(document).on("click", ".viewNotableSightingDetails", _onClickViewFullNotableDetails);
    //$(document).on("click", ".viewLocationSightingDetails", _onClickViewLocationSightings);
    // called any time the map has had its bounds changed
    google.maps.event.addListener(_map, 'dragend', this.onMapBoundsChange);
    google.maps.event.addListener(_map, 'zoom_changed', this.onMapBoundsChange);
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


var _addSearchRangeIndicator = () => {

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
