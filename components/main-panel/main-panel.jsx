import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Sidebar from '../sidebar/sidebar';
import { VelocityComponent } from 'velocity-react';
import { C, E } from '../../core/core';
import * as actions from './actions';


class MainPanel extends React.Component {
  render () {
    const { dispatch, sidebarVisible, isRequestingUserLocation, introOverlayVisible } = this.props;

    return (
      <section id="mainPanel" className="flex-body">
        <Sidebar
          visible={sidebarVisible} />
        <Map />
        <IntroOverlay
          visible={introOverlayVisible}
          loading={isRequestingUserLocation}
          onClose={() => dispatch(actions.setIntroOverlayVisibility(false))}
          searchNearby={() => dispatch(actions.getUserLocation())}
        />
      </section>
    );
  }
}

export default connect(state => ({
  introOverlayVisible: state.introOverlayVisible,
  isRequestingUserLocation: state.isRequestingUserLocation,
  sidebarVisible: state.sidebarVisible
}))(MainPanel);



class IntroOverlay extends React.Component {
  constructor (props) {
    super(props);
  }

  searchAnywhere () {

  }
  //
  //positionAvailable (position) {
  //  console.log(position);
  //}

  render () {
    console.log(this.props.loading);

    return (
      <VelocityComponent animation={{ opacity: this.props.visible ? 1 : 0 }} duration={C.TRANSITION_SPEED}>
        <div>
          <div id="map-overlay"></div>
          <div id="initSearchControls">
            <div className="tab-content">
              <span className="close-panel glyphicon glyphicon-remove-circle" onClick={this.props.onClose}></span>

              <div>
                <button className="btn btn-success" id="searchNearby" onClick={this.props.searchNearby}>
                  <i className="glyphicon glyphicon-home"></i>
                  <FormattedMessage id="searchNearby" />
                </button>
                <FormattedMessage id="findInArea" />
              </div>

              <p className="or"><FormattedMessage id="or" /></p>

              <div>
                <button className="btn btn-info" id="searchAnywhere" onClick={this.searchAnywhere.bind(this)}>
                  <i className="glyphicon glyphicon-globe"></i>
                  <FormattedMessage id="searchAnywhere" />
                </button>
                <FormattedMessage id="findAnywhere" />
              </div>
            </div>
          </div>
        </div>
      </VelocityComponent>
    );
  }
}




class Map extends React.Component {
  componentDidMount () {
    google.maps.visualRefresh = true;

    // move to props?
    var defaultMapOptions = {
      zoom: 3,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControlOptions: { mapTypeIds: [] },
      center: new google.maps.LatLng(30, 0),
      streetViewControl: false,
      disableDefaultUI: true,
      panControl: true,
      zoomControl: true,
      scaleControl: true,
      overviewMapControl: true
    };


    var mapCanvas = ReactDOM.findDOMNode(this);
    this.map = new google.maps.Map(mapCanvas, defaultMapOptions);

    this.addCustomControls();
    this.addEventHandlers();
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

