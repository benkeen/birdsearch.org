import React from 'react';
import ReactDOM from 'react-dom';


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

    this.map = new google.maps.Map(ReactDOM.findDOMNode(this), defaultMapOptions);

    this.addCustomControls();
    this.addEventHandlers();
  }

  componentDidUpdate (prevProps) {
    if (prevProps.zoom !== this.props.zoom) {
      this.map.setZoom(this.props.zoom);
    }

    this.map.setCenter({
      lat: this.props.lat,
      lng: this.props.lng
    });

    if (this.props.bounds !== null) {
      this.map.fitBounds({
        north: this.props.bounds.north,
        south: this.props.bounds.south,
        east: this.props.bounds.east,
        west: this.props.bounds.west
      });
    }
    if (this.props.results.length !== prevProps.results.length) {
      this.clearHotspots();
      this.addMarkers();

      _addMarkers("all", _data.all.lastSearch);
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

  /**
   * Adds hotspots to the map for any of the three search types: all, notable, hotspots. The first
   * param specifies the search type; the second is a standardized array of hotspot data. Format:
   *   {
	 *		locationID: ...
	 *		lat: ...
	 *		lng: ...
	 *		n: ... (location name)
	 *   }
   * The objects can contain any additional info needed; they're just ignored.
   *
   * @param searchType
   * @param hotspots
   * @private
   */
  addMarkers (searchType, data) {
    var mapBoundary = _map.getBounds();
    var boundsObj = new google.maps.LatLngBounds(mapBoundary.getSouthWest(), mapBoundary.getNorthEast());
    _visibleHotspots = [];

    for (var i=0; i<data.length; i++) {
      var currMarkerInfo = data[i];
      var locationID = currMarkerInfo.locationID;
      var latlng = new google.maps.LatLng(currMarkerInfo.lat, currMarkerInfo.lng);
      if (!boundsObj.contains(latlng)) {
        continue;
      }

      if (searchType === "all") {
        _addBirdMarker(locationID, latlng, currMarkerInfo);
      } else if (searchType === "notable") {
        _addNotableMarker(locationID, latlng, currMarkerInfo);
      } else if (searchType === "hotspots") {
        _addHotspotMarker(locationID, latlng, currMarkerInfo);
      }

      _visibleHotspots.push(currMarkerInfo);
    }
  }

  addCustomControls () {
    var btn1 = $('<div class="mapBtn">Terrain</div>')[0];
    var btn2 = $('<div class="mapBtn mapBtnSelected">Road Map</div>')[0];
    var btn3 = $('<div class="mapBtn">Satellite</div>')[0];
    var btn4 = $('<div class="mapBtn">Hybrid</div>')[0];

    // add the controls to the map
    this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn4);
    this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn3);
    this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn2);
    this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn1);

    // add the appropriate event handlers
    google.maps.event.addDomListener(btn1, 'click', function () {
      this.map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
      $(".mapBtn").removeClass('mapBtnSelected');
      $(btn1).addClass('mapBtnSelected');
    });
    google.maps.event.addDomListener(btn2, 'click', function () {
      this.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
      $(".mapBtn").removeClass('mapBtnSelected');
      $(btn2).addClass('mapBtnSelected');
    });
    google.maps.event.addDomListener(btn3, 'click', function () {
      this.map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
      $(".mapBtn").removeClass('mapBtnSelected');
      $(btn3).addClass('mapBtnSelected');
    });
    google.maps.event.addDomListener(btn4, 'click', function () {
      this.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
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
