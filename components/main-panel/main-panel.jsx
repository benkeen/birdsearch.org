import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Sidebar from '../sidebar/sidebar';
import { Loader } from '../general/general';
import Map from '../map/map';
import { VelocityComponent } from 'velocity-react';
import { C, E } from '../../core/core';
import * as actions from './actions';


class MainPanel extends React.Component {
  render () {
    const { dispatch, sidebarVisible, isRequestingUserLocation, introOverlayVisible, mapSettings } = this.props;

    return (
      <section id="mainPanel" className="flex-body">
        <Sidebar
          visible={sidebarVisible} />
        <Map
          zoom={mapSettings.zoom}
          mapTypeId={mapSettings.mapTypeId}
          lat={mapSettings.lat}
          lng={mapSettings.lng} />
        <IntroOverlay
          visible={introOverlayVisible}
          loading={isRequestingUserLocation}
          onClose={() => dispatch(actions.setIntroOverlayVisibility(false))}
          searchNearby={() => dispatch(actions.getGeoLocation())}
          searchAnywhere={() => dispatch(actions.setIntroOverlayVisibility(false))} />
      </section>
    );
  }
}

export default connect(state => ({
  mapSettings: state.mapSettings,
  introOverlayVisible: state.overlays.intro,
  isRequestingUserLocation: state.userLocation.isFetching,
  sidebarVisible: state.sidebarVisible
}))(MainPanel);



class IntroOverlay extends React.Component {
  constructor (props) {
    super(props);
    this.state = { visible: props.visible };
  }

  transitionComplete () {
    if (!this.props.visible) {
      this.setState({ visible: false });
    }
  }

  getLoader () {
    if (this.props.loading) {
      return (<Loader label="FINDING LOCATION..." />);
    }
  }

  // may generalize this sucker
  getOverlay () {
    if (!this.state.visible) {
      return null;
    }
    return (<div id="map-overlay"></div>);
  }

  render () {
    var overlayClass = (this.props.loading) ? 'loading' : '';

    return (
      <VelocityComponent animation={{ opacity: this.props.visible ? 1 : 0 }} duration={C.TRANSITION_SPEED} complete={this.transitionComplete.bind(this)}>
        <div>
          {this.getOverlay()}
          <div id="intro-overlay" className={overlayClass}>
            <div className="tab-wrapper">
              {this.getLoader()}

              <div className="tab-content">
                <span className="close-panel glyphicon glyphicon-remove-circle" onClick={this.props.onClose}></span>

                <div>
                  <button className="btn btn-success" id="searchNearby" onClick={this.props.searchNearby} disabled={this.props.loading}>
                    <i className="glyphicon glyphicon-home"></i>
                    <FormattedMessage id="searchNearby" />
                  </button>
                  <FormattedMessage id="findInArea" />
                </div>

                <p className="or"><FormattedMessage id="or" /></p>

                <div>
                  <button className="btn btn-info" id="searchAnywhere" onClick={this.props.searchAnywhere} disabled={this.props.loading}>
                    <i className="glyphicon glyphicon-globe"></i>
                    <FormattedMessage id="searchAnywhere" />
                  </button>
                  <FormattedMessage id="findAnywhere" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </VelocityComponent>
    );
  }
}
IntroOverlay.PropTypes = {
  loading: React.PropTypes.bool.isRequired
};



