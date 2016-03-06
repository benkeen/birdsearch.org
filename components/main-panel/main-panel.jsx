import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Loader, ClosePanel } from '../general/general';
import Map from '../map/map';
import { VelocityComponent } from 'velocity-react';
import { C, E, _, actions } from '../../core/core';
import { LocationsPanel } from './locations-panel';
import { SpeciesPanel } from './species-panel';


class MainPanel extends React.Component {
  constructor (props) {
    super(props);
  }

  componentDidMount () {
    $(window).resize(this.onResize.bind(this));
  }

  onResize () {
    var windowHeight = $(window).height();
    var windowWidth  = $(window).width();

    //var viewportMode = 'desktop';
    //if (windowWidth < _VIEWPORT_WIDTH_BREAKPOINT) {
    //  viewportMode = 'mobile';
    //}
    this.props.dispatch(actions.onWindowResize(windowWidth, windowHeight));
  }

  render () {
    const { dispatch, env, user, overlayVisibility, mapSettings, searchSettings, locationsPanel, speciesPanel, results } = this.props;

    return (
      <section id="main-panel" className="flex-body">
        <Map
          dispatch={dispatch}
          env={env}
          zoom={mapSettings.zoom}
          lat={mapSettings.lat}
          lng={mapSettings.lng}
          mapTypeId={mapSettings.mapTypeId}
          bounds={mapSettings.bounds}
          searchSettings={searchSettings}
          results={results} />

        <IntroOverlay
          visible={overlayVisibility.intro}
          loading={user.isFetching}
          userLocationFound={user.userLocationFound}
          onClose={() => dispatch(actions.setIntroOverlayVisibility(false))}
          searchNearby={() => dispatch(actions.getGeoLocation())}
          onUserLocationFound={() => dispatch(actions.search(searchSettings, mapSettings))}
          searchAnywhere={() => dispatch(actions.setIntroOverlayVisibility(false))} />

        <AdvancedSearchOverlay />

        <LocationsPanel
          dispatch={dispatch}
          visible={locationsPanel.visible}
          sort={locationsPanel.sort}
          sortDir={locationsPanel.sortDir}
          locations={results.visibleLocations}
          locationSightings={results.locationSightings}
          searchSettings={searchSettings}
          env={env} />

        <SpeciesPanel
          dispatch={dispatch}
          visible={speciesPanel.visible}
          locations={results.visibleLocations}
          env={env} />
      </section>
    );
  }
}

export default connect(state => ({
  env: state.env,
  mapSettings: state.mapSettings,
  searchSettings: state.searchSettings,
  overlayVisibility: state.overlayVisibility,
  locationsPanel: state.locationsPanel,
  speciesPanel: state.speciesPanel,
  user: state.user,
  results: state.results
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

  // Urgh! at this point I want to fire off an actual search request. But in order to do that, I need all the search
  // settings info. So we either:
  // - somehow listen to the RECEIVED_USER_LOCATION event (in a reducer, I guess), change something in the store which
  // a component would listen to, then in its componentDidUpdate() method call the search? Jesus. This is awful.
  componentDidUpdate (prevProps) {
    if (prevProps.userLocationFound !== this.props.userLocationFound && this.props.userLocationFound === true) {
      this.props.onUserLocationFound();
    }
  }

  componentDidMount () {
    // if the browser doesn't support geolocation, disable the option (but don't hide it: rub it in that they're using
    // an old crap browser)
    //navigator.geolocation) { }
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
