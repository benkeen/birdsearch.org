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
  }
};

// any time the map boundary changes, the list of hotspots may change. This keeps a list of the hotspots within the
// boundary, ignoring what is visible on the map (i.e. via a location filter)
var _currentHotspotIDsInMapBoundaries = [];


export class Map extends React.Component {
  constructor (props) {
    super(props);
    this.onMapBoundsChange = this.onMapBoundsChange.bind(this);
    this.getBirdSightingsInfoWindow = this.getBirdSightingsInfoWindow.bind(this);
  }

  componentDidMount () {
    google.maps.visualRefresh = true;
    var defaultMapOptions = {

      // customizable
      zoom: this.props.zoom,
      mapTypeId: this.props.mapTypeId,
      center: new google.maps.LatLng(this.props.lat, this.props.lng),

      // not customizable
      streetViewControl: false,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_RIGHT,
        mapTypeIds: ['roadmap', 'satellite']
      },
      styles: [{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},{"featureType":"water","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#C6E2FF"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#C5E3BF"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#D1D1B8"}]}]
    };

    _map = new google.maps.Map(ReactDOM.findDOMNode(this), defaultMapOptions);

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

    this.applyLocationFilter(nextProps);

    if ((this.props.lat !== nextProps.lat || this.props.lng !== nextProps.lng) &&
      (_.isNumber(nextProps.lat) && _.isNumber(nextProps.lng))) {
      _map.setCenter({
        lat: nextProps.lat,
        lng: nextProps.lng
      });
      _addSearchRangeIndicator();
    }

    if (nextProps.zoom !== this.props.zoom) {
//      console.log('setting zoom....', nextProps.zoom);
      _map.setZoom(nextProps.zoom);
    }

    if (this.props.bounds === null && nextProps.bounds !== null) {
      _map.fitBounds({
        north: nextProps.bounds.north,
        south: nextProps.bounds.south,
        east: nextProps.bounds.east,
        west: nextProps.bounds.west
      });
    }

    var numLocationsChanged = this.props.results.allLocations.length !== nextProps.results.allLocations.length;
    var windowResized = this.props.env.width !== nextProps.env.width || this.props.env.height !== nextProps.env.height;
    if (numLocationsChanged || windowResized) {
      this.updateMapMarkers(nextProps.results.allLocations, nextProps.results.locationSightings, true, nextProps.zoom);
    }

    this.showMarkerColours(nextProps);

    // never update the map with React. We do it all internally. It's way too slow otherwise
    return false;
  }

  showMarkerColours (nextProps) {
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

  // called any time the map bounds change: onload, zoom, drag. This ensures the appropriate markers are shown.
  updateMapMarkers (locations, locationSightings, zoomOutToShowResults = false, zoom = null) {
    var mapBoundary = _map.getBounds();
    var boundsObj = new google.maps.LatLngBounds(mapBoundary.getSouthWest(), mapBoundary.getNorthEast());
    var hotspotsInBounds = [];
    let hotspotIDsInBounds = [];

    locations.forEach((locInfo) => {
      var latlng = new google.maps.LatLng(locInfo.la, locInfo.lg);
      var locID = locInfo.i;

      // filter out-of-bounds markers
      if (!boundsObj.contains(latlng)) {
        if (_.has(_data.all.markers, locID)) {
          _data.all.markers[locID].marker.setMap(null);
        }
        return;
      }

      if (_.has(_data.all.markers, locID)) {
        this.showMarkerWithFilter(locInfo);
      } else {
        this.createBirdMarker(locID, latlng, locInfo);
      }
      hotspotsInBounds.push(locInfo);
      hotspotIDsInBounds.push(locInfo.i);

      //if (searchType === "all") {
      //  _addBirdMarker(locationID, latlng, currMarkerInfo);
      //} else if (searchType === "notable") {
      //  _addNotableMarker(locationID, latlng, currMarkerInfo);
      //}
    });

    // for new searches, the default search zoom level may not show any results. We know there are results so we zoom
    // out as far as needed to show the first result
    if (zoomOutToShowResults && hotspotsInBounds.length === 0) {
      console.log('setting zoom....', this.props.zoom);

      const newZoom = zoom - 1;
      _map.setZoom(newZoom);
      console.log('zooming out!', zoom, newZoom);
      return this.updateMapMarkers(locations, locationSightings, true, newZoom);
    }

    // if the list of hotspots in the map boundary changed, publish the info
    if (_.intersection(_currentHotspotIDsInMapBoundaries, hotspotIDsInBounds).length !== hotspotIDsInBounds.length) {
      this.props.dispatch(actions.visibleLocationsFound(hotspotsInBounds, locationSightings));
    }

    _currentHotspotIDsInMapBoundaries = hotspotIDsInBounds;
  }

  // only call this after a new search
  clearHotspots () {
    for (var locationID in _data.all.markers) {
      _data.all.markers[locationID].marker.setMap(null);
    }
    for (var locationID in _data.notable.markers) {
      _data.notable.markers[locationID].setMap(null);
    }
  }

  onMapBoundsChange () {
    const { results } = this.props;
    this.updateMapMarkers(results.allLocations, results.locationSightings);
  }

  addEventHandlers () {
    const dispatch = this.props.dispatch;

    $(document).on('click', '.viewLocationSightingDetails', (e) => {
      this.props.dispatch(actions.selectLocation($(e.target).data('locationId')));
      this.props.dispatch(actions.showSpeciesPanel());
    });

    // called any time the map has had its bounds changed
    google.maps.event.addListener(_map, 'dragend', this.onMapBoundsChange);
    google.maps.event.addListener(_map, 'zoom_changed', this.onMapBoundsChange);
  }

  applyLocationFilter (nextProps) {
    const { locationFilter } = this.props;

    // if the location filter just changed, update the list of hidden/visible markers
    if (locationFilter !== nextProps.locationFilter) {
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
  }

  // adds a marker, taking into account whether a filter is applied
  showMarkerWithFilter (locInfo) {
    const { locationFilter } = this.props;
    let show = true;
    if (locationFilter !== '') {
      var regexp = new RegExp(locationFilter, 'i'); // hmm... this runs for EVERY marker
      show = regexp.test(locInfo.n);
    }
    if (show) {
      _data.all.markers[locInfo.i].marker.setMap(_map);
    }
  }

  createBirdMarker (locationID, latlng, currMarkerInfo) {
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

    let getBirdSightingsInfoWindow = this.getBirdSightingsInfoWindow;
    ((marker, infoWindow, locInfo) => {
      google.maps.event.addListener(marker, 'click', function () {
        infoWindow.setContent(ReactDOMServer.renderToString(getBirdSightingsInfoWindow(locInfo)));
        infoWindow.open(_map, this);
      });
    })(_data.all.markers[locationID].marker, _data.all.infoWindows[locationID], currMarkerInfo);
  };


  // this DOES have access to the latest props, but NOT FormattedMessage ...????????


  getBirdSightingsInfoWindow (locInfo) {
    const { results, searchSettings } = this.props;
    var locationSightings = results.locationSightings[locInfo.i].data;
    const obsRecency = searchSettings.observationRecency;
    var numSpecies = 0;
    if (results.locationSightings[locInfo.i].fetched) {
      numSpecies = locationSightings[obsRecency - 1].numSpeciesRunningTotal;
    }

    return (
      <div className="marker-popup">
        <h4>{locInfo.n}</h4>
        <a href="#" className="viewLocationSightingDetails" data-location-id={locInfo.i}>
          <b>{numSpecies}</b> bird species seen in the last <b>{obsRecency}</b> days
        </a>
      </div>
    );
  };

  getNotableSightingsInfoWindow () {

// <h4><%=locationName%></h4>

// <table class="dialogTable">
// 	<tbody>
// 	<% _.each(sightings, function(sighting, index) { %>
// 	<tr>
// 		<td style="padding-right:30px"><%=sighting.comName%></td>
// 		<td><%=sighting.obsDt%></td>
// 	</tr>
// 	<% }); %>
// 	</tbody>
// </table>

// <div class="dialogBottomLink">
// 	<a href="#" class="viewNotableSightingDetails" data-location-id="<%=locationID%>"><%=L.view_full_info%> &raquo;</a>
// </div>

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
