import React from 'react';
import ReactDOM from 'react-dom';


class Map extends React.Component {

  componentDidMount () {
    const { dispatch, lat, lng, zoom, mapTypeId } = this.props;

    google.maps.visualRefresh = true;
    var defaultMapOptions = {

      // customizable
      zoom: zoom,
      mapTypeId: mapTypeId,
      center: new google.maps.LatLng(lat, lng),

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

    //if (msg.data.viewportObj) {
    //  _map.fitBounds(msg.data.viewportObj);
    //} else {
    //  _map.setCenter(msg.data.locationObj);
    //}

    // this.map.setCenter(msg.data.locationObj);
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

export default Map;
