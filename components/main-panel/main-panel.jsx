import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Loader, ClosePanel } from '../general/general';
import Map from '../map/map';
import { VelocityComponent } from 'velocity-react';
import { C, E } from '../../core/core';
import * as actions from './actions';


class MainPanel extends React.Component {
  render () {
    const { dispatch, isRequestingUserLocation, overlayVisibility, mapSettings, panelVisibility } = this.props;

    return (
      <section id="mainPanel" className="flex-body">
        <Map
          zoom={mapSettings.zoom}
          mapTypeId={mapSettings.mapTypeId}
          lat={mapSettings.lat}
          lng={mapSettings.lng} />

        <IntroOverlay
          visible={overlayVisibility.intro}
          loading={isRequestingUserLocation}
          onClose={() => dispatch(actions.setIntroOverlayVisibility(false))}
          searchNearby={() => dispatch(actions.getGeoLocation())}
          searchAnywhere={() => dispatch(actions.setIntroOverlayVisibility(false))} />

        <AdvancedSearchOverlay
          />

        <div id="map-panels">
          <div id="panels">
            <div id="left-panel">
              <OverviewPanel
                dispatch={dispatch}
                visible={panelVisibility.overview} />
              <LocationPanel
                dispatch={dispatch}
                visible={panelVisibility.locations} />
            </div>
            <SpeciesPanel
              dispatch={dispatch}
              visible={panelVisibility.species} />
          </div>
        </div>

        <PanelToggleButtons
          dispatch={dispatch}
          panelVisibility={panelVisibility} />
      </section>
    );
  }
}

export default connect(state => ({
  mapSettings: state.mapSettings,
  overlayVisibility: state.overlayVisibility,
  panelVisibility: state.panelVisibility,
  isRequestingUserLocation: state.userLocation.isFetching
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
    return (this.props.loading) ? (<Loader label="FINDING YOUR LOCATION..." />) : null;
  }

  getOverlay () {
    return (this.state.visible) ? (<div id="map-overlay"></div>) : null;
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
                <ClosePanel onClose={this.props.onClose} />

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


class AdvancedSearchOverlay extends React.Component {
  transitionComplete () {

  }

  render () {
    return (
      <VelocityComponent animation={{ opacity: this.props.visible ? 1 : 0 }} duration={C.TRANSITION_SPEED} complete={this.transitionComplete.bind(this)}>
        <div>
        </div>
      </VelocityComponent>
    );
  }
}

class OverviewPanel extends React.Component {
  render () {
    const { dispatch, visible } = this.props;
    return (
      <VelocityComponent animation={{ opacity: visible ? 1 : 0 }} duration={C.TRANSITION_SPEED}>
        <div id="overview-panel" className="panel">
          <ClosePanel onClose={() => dispatch(actions.togglePanelVisibility(C.PANELS.OVERVIEW))} />
          <h1>Locations: <span></span></h1>
          <h1>Species: <span></span></h1>
        </div>
      </VelocityComponent>
    );
  }
}
OverviewPanel.PropTypes = {
  visible: React.PropTypes.bool.isRequired
};


class LocationPanel extends React.Component {
  render () {
    const { dispatch, visible } = this.props;
    return (
      <VelocityComponent animation={{ opacity: visible ? 1 : 0 }} duration={C.TRANSITION_SPEED}>
        <div id="locations-panel" className="panel">
          <ClosePanel onClose={() => dispatch(actions.togglePanelVisibility(C.PANELS.LOCATIONS))} />
        </div>
      </VelocityComponent>
    );
  }
}
LocationPanel.PropTypes = {
  visible: React.PropTypes.bool.isRequired
};


class SpeciesPanel extends React.Component {
  render () {
    const { dispatch, visible } = this.props;
    return (
      <VelocityComponent animation={{ opacity: visible ? 1 : 0 }} duration={C.TRANSITION_SPEED}>
        <div id="species-panel" className="panel">
          <ClosePanel onClose={() => dispatch(actions.togglePanelVisibility(C.PANELS.SPECIES))} />
        </div>
      </VelocityComponent>
    );
  }
}
SpeciesPanel.PropTypes = {
  visible: React.PropTypes.bool.isRequired
};


class PanelToggleButtons extends React.Component {
  render () {
    const { dispatch, panelVisibility } = this.props;

    var overviewClasses = 'label label-success' + ((panelVisibility.overview) ? '' : ' disabled');
    var locationClasses = 'label label-warning' + ((panelVisibility.locations) ? '' : ' disabled');
    var birdClasses = 'label label-primary' + ((panelVisibility.species) ? '' : ' disabled');

    return (
      <div id="panel-toggle-buttons" className="panel">
        <nav>
          <a className={overviewClasses} onClick={() => dispatch(actions.togglePanelVisibility(C.PANELS.OVERVIEW))}>overview</a>
          <a className={locationClasses} onClick={() => dispatch(actions.togglePanelVisibility(C.PANELS.LOCATIONS))}>locations</a>
          <a className={birdClasses} onClick={() => dispatch(actions.togglePanelVisibility(C.PANELS.SPECIES))}>species</a>
        </nav>
      </div>
    )
  }
}
