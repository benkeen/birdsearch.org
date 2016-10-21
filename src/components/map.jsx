import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import { FormattedMessage } from 'react-intl';
import { C, _, actions, helpers } from '../core/core';


var _icons = {
  range1: { url: 'images/markers/white.png', scaledSize: new google.maps.Size(21, 26) },
  range2: { url: 'images/markers/grey.png', scaledSize: new google.maps.Size(21, 26) },
  range3: { url: 'images/markers/sea-blue.png', scaledSize: new google.maps.Size(21, 26) },
  range4: { url: 'images/markers/turquoise.png', scaledSize: new google.maps.Size(21, 26) },
  range5: { url: 'images/markers/green.png', scaledSize: new google.maps.Size(21, 26) },
  range6: { url: 'images/markers/yellow.png', scaledSize: new google.maps.Size(21, 26) },
  range7: { url: 'images/markers/orange.png', scaledSize: new google.maps.Size(21, 26) },
  range8: { url: 'images/markers/red.png', scaledSize: new google.maps.Size(21, 26) },

  notable: { url: 'images/markers/notable.png', scaledSize: new google.maps.Size(21, 26) },
};
var _circleOverlays = {};
var _circleOverlayIndex = 0;

// stores all map-related data, grouped by search type
var _map;
var _data = {
  [C.SEARCH_SETTINGS.SEARCH_TYPES.ALL]: {
    defaultZoomLevel: 9,
    circleRadius: 60000,
    infoWindows: {},
    markers: {}
  },
  [C.SEARCH_SETTINGS.SEARCH_TYPES.NOTABLE]: {
    defaultZoomLevel: 7,
    circleRadius: 250000,
    infoWindows: {},
    markers: {}
  }
};

// any time the map boundary changes, the list of hotspots may change. This keeps a list of the hotspots within the
// boundary, ignoring what is visible on the map (i.e. via a location filter)
var _currentHotspotIDsInMapBoundaries = [];
var _currentSearchType;


export class Map extends React.Component {
  constructor (props) {
    super(props);
    this.onMapBoundsChange = this.onMapBoundsChange.bind(this);
    this.getBirdSightingsInfoWindow = this.getBirdSightingsInfoWindow.bind(this);
    this.getNotableSightingsInfoWindow = this.getNotableSightingsInfoWindow.bind(this);
  }

  componentDidMount () {
    google.maps.visualRefresh = true;
    var defaultMapOptions = {

      // customizable
      mapTypeId: this.props.mapTypeId,
      center: new google.maps.LatLng(this.props.lat, this.props.lng),

      // not customizable
      zoom: 3,
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

    _currentSearchType = nextProps.searchSettings.searchType;

    // this may need tweaking.
    const isNewLocationSearch = this.props.searchSettings.location !== nextProps.searchSettings.location;

    this.applyLocationFilter(nextProps);

    if ((this.props.lat !== nextProps.lat || this.props.lng !== nextProps.lng) &&
      (_.isNumber(nextProps.lat) && _.isNumber(nextProps.lng))) {
      _map.setCenter({
        lat: nextProps.lat,
        lng: nextProps.lng
      });
      _addSearchRangeIndicator();
    }

    if (isNewLocationSearch) {
      if (nextProps.searchSettings.zoomHandling === C.SEARCH_SETTINGS.ZOOM_HANDLING.AUTO_ZOOM) {
        if (this.props.bounds === null && nextProps.bounds !== null) {
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

    var numLocationsChanged = this.props.results.allLocations.length !== nextProps.results.allLocations.length;
    var windowResized = this.props.env.width !== nextProps.env.width || this.props.env.height !== nextProps.env.height;
    if (numLocationsChanged || windowResized) {
      this.updateMapMarkers(nextProps.searchSettings.searchType, nextProps.results.allLocations, nextProps.results.locationSightings, true);
    }

    if (_currentSearchType === C.SEARCH_SETTINGS.SEARCH_TYPES.ALL) {
      this.setMarkerColours(nextProps);
    } else {
      this.setNotableMarkerColours(nextProps);
    }

    // we never update the map with React - it's done internally. It's way too slow otherwise.
    return false;
  }

  setMarkerColours (nextProps) {
    _.each(nextProps.results.visibleLocations, function (locInfo) {
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

  setNotableMarkerColours (nextProps) {
    _.each(nextProps.results.visibleLocations, (locInfo) => {
      _data[_currentSearchType].markers[locInfo.i].marker.setIcon(_icons.notable);
    });
  }

  // called any time the map bounds change: onload, zoom, drag. This ensures the appropriate markers are shown.
  updateMapMarkers (searchType, locations, locationSightings, zoomOutToShowResults = false) {
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
      var locID = locInfo.i;

      // filter out-of-bounds markers
      if (!boundsObj.contains(latlng)) {
        if (_.has(_data[_currentSearchType].markers, locID)) {
          _data[_currentSearchType].markers[locID].marker.setMap(null);
        }
        return;
      }

      if (_.has(_data[_currentSearchType].markers, locID)) {
        this.showMarkerWithFilter(locInfo);
      } else {
        if (searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.ALL) {
          this.addBirdMarker(searchType, locID, latlng, locInfo);
        } else {
          this.addNotableMarker(searchType, locID, latlng, locInfo);
        }
      }

      locationsInBounds.push(locInfo);
      locationIDsInBounds.push(locInfo.i);
    });

    // for new searches, the default search zoom level may not show any results. We know there are results so we zoom
    // out as far as needed to show the first result
    if (zoomOutToShowResults && locationsInBounds.length === 0) {
      let center = _map.getCenter();
      const closestLatLng = helpers.findClosestLatLng(center.lat(), center.lng(), latLngList);

      // find the smallest bounds that fits the current map centerpoint and the closest point
      const boundsObj = new google.maps.LatLngBounds(center, { lat: closestLatLng.lat, lng: closestLatLng.lng });
      _map.fitBounds(boundsObj);

      return this.updateMapMarkers(searchType, locations, locationSightings, true);
    }

    const newSorted = locationIDsInBounds.sort();

    // if the list of hotspots in the map boundary changed, publish the info
    if (!_.isEqual(newSorted, _currentHotspotIDsInMapBoundaries)) {
      this.props.dispatch(actions.visibleLocationsFound(searchType, locationsInBounds, locationSightings));
    }

    _currentHotspotIDsInMapBoundaries = newSorted;
  }

  // only call this after a new search
  clearHotspots () {
    for (var locationID in _data[C.SEARCH_SETTINGS.SEARCH_TYPES.ALL].markers) {
      _data[C.SEARCH_SETTINGS.SEARCH_TYPES.ALL].markers[locationID].marker.setMap(null);
    }
    for (var locationID in _data[C.SEARCH_SETTINGS.SEARCH_TYPES.NOTABLE].markers) {
      _data[C.SEARCH_SETTINGS.SEARCH_TYPES.NOTABLE].markers[locationID].setMap(null);
    }
  }

  onMapBoundsChange () {
    const { results, searchSettings } = this.props;
    this.updateMapMarkers(searchSettings.searchType, results.allLocations, results.locationSightings);
  }

  addEventHandlers () {
    const dispatch = this.props.dispatch;

    $(document).on('click', '.viewLocationSightingDetails', (e) => {
      dispatch(actions.selectLocation($(e.target).data('locationId')));
      dispatch(actions.showSightingsPanel());
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
  showMarkerWithFilter (locInfo) {
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

  addBirdMarker (searchType, locationID, latlng, currMarkerInfo) {
    if (_.has(_data[_currentSearchType].markers, locationID)) {
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
    _data[_currentSearchType].infoWindows[locationID] = new google.maps.InfoWindow();

    let getInfoWindow = this.getBirdSightingsInfoWindow;
    ((marker, infoWindow, locInfo) => {
      google.maps.event.addListener(marker, 'click', function () {
        infoWindow.setContent(ReactDOMServer.renderToString(getInfoWindow(locInfo)));
        infoWindow.open(_map, this);
      });
    })(_data[_currentSearchType].markers[locationID].marker, _data[_currentSearchType].infoWindows[locationID], currMarkerInfo);
  };

  addNotableMarker (searchType, locationID, latlng, currMarkerInfo) {
    if (_.has(_data[_currentSearchType].markers, locationID)) {
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
    _data[_currentSearchType].infoWindows[locationID] = new google.maps.InfoWindow();

    let getInfoWindow = this.getNotableSightingsInfoWindow;
    ((marker, infoWindow, locInfo) => {
      google.maps.event.addListener(marker, 'click', function () {
        infoWindow.setContent(ReactDOMServer.renderToString(getInfoWindow(locInfo)));
        infoWindow.open(_map, this);
      });
    })(_data[_currentSearchType].markers[locationID].marker, _data[_currentSearchType].infoWindows[locationID], currMarkerInfo);
  }

  getBirdSightingsInfoWindow (locInfo) {
    const { results, searchSettings } = this.props;
    var locationSightings = results.locationSightings[locInfo.i].data;
    const obsRecency = searchSettings.observationRecency;
    var numSpecies = 0;
    if (results.locationSightings[locInfo.i].fetched) {
      numSpecies = locationSightings[obsRecency - 1].runningTotal;
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

  getNotableSightingsInfoWindow (locInfo) {
    const { results, searchSettings } = this.props;
    var locationSightings = results.locationSightings[locInfo.i].data;
    const obsRecency = searchSettings.observationRecency;
//    var numSpecies = 0;
//    if (results.locationSightings[locInfo.i].fetched) {
//      numSpecies = locationSightings[obsRecency - 1].numSpeciesRunningTotal;
//    }

    // use helpers.getNotableSightingsList()

    const sightings = [];
    for (var i=0; i<obsRecency; i++) {
      for (var j=0; j<locationSightings[i].obs.length; j++) {
        sightings.push(locationSightings[i].obs[j]);
      }
    }

    return (
      <div className="marker-popup">
        <h4>{locInfo.n}</h4>

        <div className="notable-sightings-list-wrapper">
          <table className="notable-sightings-list">
            <tbody>
            {this.getNotableRows(sightings)}
            </tbody>
          </table>
        </div>
        <a href="#" className="viewLocationSightingDetails" data-location-id={locInfo.i}>View full information</a>
      </div>
    );
  }

  getNotableRows (sightings) {
    return _.map(sightings, (sighting) => {
      const checklistLink = `http://ebird.org/ebird/view/checklist/${sighting.subID}`;
      return (
        <tr key={sighting.obsID}>
          <td className="species-name">{sighting.comName}</td>
          <td className="obs-date">{sighting.obsDtDisplay}</td>
          <td>
            <a href={checklistLink} target="_blank" className="checklist-link glyphicon glyphicon-list" title="View Checklist"></a>
          </td>
        </tr>
      );
    });
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
    radius: _data[_currentSearchType].circleRadius,
    editable: false,
    stroke_weight: 0,
    always_fit_to_map: false
  });
  _circleOverlayIndex++;
};
