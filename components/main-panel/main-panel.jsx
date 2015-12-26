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
    const { dispatch, introOverlayVisible } = this.props;

    return (
      <section id="mainPanel" className="flex-body">
        <Sidebar />
        <Map />
        <IntroOverlay
          visible={introOverlayVisible}
          onClose={() => dispatch(actions.setIntroOverlayVisiblity(false))}
        />
      </section>
    );
  }
}

export default connect(state => ({ introOverlayVisible: state.introOverlayVisible }))(MainPanel);



class IntroOverlay extends React.Component {
  constructor (props) {
    super(props);
  }

  searchNearby () {

  }

  searchAnywhere () {

  }

  render () {
    return (
      <VelocityComponent animation={{ opacity: this.props.visible ? 1 : 0 }} duration={C.TRANSITION_SPEED}>
        <div>
          <div id="map-overlay"></div>
          <div id="initSearchControls">
            <div className="tab-content">
              <span className="close-panel glyphicon glyphicon-remove-circle" onClick={this.props.onClose}></span>

              <div>
                <button className="btn btn-success" id="searchNearby" onClick={this.searchNearby.bind(this)}>
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

class SearchPanel extends React.Component {

  render () {
    return (
      <div>
        <div id="searchPanel">
          <input type="text" id="location" placeholder={L.please_enter_location_search_default} />

          <ul id="resultTypeGroup">
            <li class="selected">
              <input type="radio" name="resultType" id="rt1" value="all" checked={true} />
              <label for="rt1"><FormattedMessage id="birdSightings" /></label>
            </li>
            <li>
              <input type="radio" name="resultType" id="rt2" value="notable" />
              <label for="rt2"><FormattedMessage id="notableSightings" /></label>
            </li>
            <li>
              <input type="radio" name="resultType" id="rt3" value="hotspots" />
              <label for="rt3"><FormattedMessage id="popularBirdingLocations" /></label>
            </li>
          </ul>

          <div id="observationRecencySection" style="display:none">
            <label for="observationRecency">
              {L.show_obs_made_within_last} <span id="observationRecencyDisplay">7</span> {L.day_or_days}
            </label>
            <ol class="rangeTip">
              <li class="rangeTipLeft">1</li>
              <li>
                <input type="range" id="observationRecency" min="1" max="30" value="7" />
              </li>
              <li class="rangeTipRight">30</li>
            </ol>
            <div class="clear"></div>
          </div>

          <div id="hotspotActivitySection" style="display:none">
            <input type="checkbox" id="limitHotspotsByObservationRecency" />
            <label for="limitHotspotsByObservationRecency">
              {L.limit_to_locations} <span id="hotspotActivityRecencyDisplay">7</span> {L.day_or_days}
            </label>
            <ol class="rangeTip">
              <li class="rangeTipLeft">1</li>
              <li>
                <input type="range" id="hotspotActivity" min="1" max="30" value="7" />
              </li>
              <li class="rangeTipRight">30</li>
            </ol>
          </div>

          <div>
            <input type="submit" class="btn btn-primary" id="searchBtn" value="<%=L.search%> &raquo;" />
            <span id="loadingSpinner" />
          </div>
        </div>

      </div>
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
    var map       = new google.maps.Map(mapCanvas, defaultMapOptions);
  }

  render () {
    //_addCustomControls();
    //_addEventHandlers();
    //
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

