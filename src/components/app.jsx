import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { VelocityComponent, VelocityTransitionGroup } from 'velocity-react';
import { C, _, actions } from '../core/core';
import Header from './header';
import Map from './map';
import { Loader } from './general';
import { LocationsPanel } from './locations';
import { SpeciesPanel } from './species';
import IntroOverlay from './intro';


// this is our top-level component. It contains the header, map and controls. The router passes in other components as
// children (e.g /about, /advanced-search and so on). They are all overlays. The default overlay for the site is the
// intro overlay
class App extends React.Component {
  constructor (props) {
    super(props);
    this.onResize = this.onResize.bind(this);
    this.getModal = this.getModal.bind(this);
  }

  componentDidMount () {
    $(window).resize(this.onResize);
  }

  // our global window resize listener
  onResize () {
    var windowHeight = $(window).height();
    var windowWidth  = $(window).width();
    this.props.dispatch(actions.onWindowResize(windowWidth, windowHeight));
  }

  getModal () {
    const { children, location, introOverlay, results } = this.props;
    let modal = children;

    // if the user is arriving at the site for the first time, show the intro overlay, even though we're at the root (/).
    // If they want to see it again, they'll be routed to /intro
    if (!children) {
      if (introOverlay.visible && !introOverlay.hasBeenClosedAtLeastOnce) {
        modal = <IntroOverlay />;
      } else if (results.isFetching) {
        modal = <DataLoader />;
      }
    }

    return (
      <VelocityTransitionGroup runOnMount={true} enter={{ animation: 'fadeIn' }} leave={{ animation: 'fadeOut' }} component="div">
        {modal ? React.cloneElement(modal, { key: location.pathname }) : undefined}
      </VelocityTransitionGroup>
    );
  }

  render () {
    const { dispatch, env, mapSettings, searchSettings, locationsPanel, speciesPanel, results, intl } = this.props;

    const classes = 'flex-body' + (results.visibleLocations.length > 0 ? ' has-results' : '');
    return (
      <div id="page-wrapper">
        <Header />

        <section id="main-panel" className={classes}>
          <Map
            dispatch={dispatch}
            env={env}
            zoom={mapSettings.zoom}
            lat={mapSettings.lat}
            lng={mapSettings.lng}
            searchCounter={mapSettings.searchCounter}
            mapTypeId={mapSettings.mapTypeId}
            bounds={mapSettings.bounds}
            searchSettings={searchSettings}
            results={results}
            locationFilter={locationsPanel.filter} />

          {this.getModal()}

          <LocationsPanel
            dispatch={dispatch}
            visible={locationsPanel.visible}
            updateCounter={locationsPanel.updateCounter}
            sort={locationsPanel.sort}
            sortDir={locationsPanel.sortDir}
            filter={locationsPanel.filter}
            locations={results.visibleLocations}
            locationSightings={results.locationSightings}
            locationDataRefreshCounter={results.locationDataRefreshCounter}
            selectedLocation={locationsPanel.selectedLocation}
            searchSettings={searchSettings}
            intl={intl}
            env={env} />

          <SpeciesPanel
            dispatch={dispatch}
            visible={speciesPanel.visible}
            updateCounter={speciesPanel.updateCounter}
            locations={results.visibleLocations}
            sightings={results.locationSightings}
            selectedLocation={locationsPanel.selectedLocation}
            searchSettings={searchSettings}
            speciesFilter={speciesPanel.filter}
            env={env}
            intl={intl}
            results={results}
            sort={speciesPanel.sort}
            sortDir={speciesPanel.sortDir} />
        </section>
      </div>
    );
  }
}

export default injectIntl(connect(state => ({
  env: state.env,
  mapSettings: state.mapSettings,
  searchSettings: state.searchSettings,
  introOverlay: state.introOverlay,
  locationsPanel: state.locationsPanel,
  speciesPanel: state.speciesPanel,
  user: state.user,
  results: state.results,
  intl: intlShape.isRequired
}))(App));


class DataLoader extends React.Component {
  render () {
    return (
      <div id="data-loader" className="overlay">
        <Loader label="" />
      </div>
    );
  }
}
