import React from 'react';
import { connect } from 'react-redux';
import { VelocityComponent, VelocityTransitionGroup } from 'velocity-react';
import { C, _, actions } from '../core/core';
import Header from '../components/header';
import Map from '../components/map';
import { LocationsPanel } from '../components/locations-panel';
import { SpeciesPanel } from '../components/species-panel';


// this is our top-level component. It contains the header, map and controls. The router passes in other components as
// children (e.g /about, /advanced-search and so on). They are all overlays. The default overlay for the site is the
// intro overlay
class App extends React.Component {
  constructor (props) {
    super(props);
    this.onResize = this.onResize.bind(this);
  }

  componentDidMount () {
    $(window).resize(this.onResize);
  }

  onResize () {
    var windowHeight = $(window).height();
    var windowWidth  = $(window).width();
    this.props.dispatch(actions.onWindowResize(windowWidth, windowHeight));
  }

  render () {
    const { dispatch, env, mapSettings, searchSettings, locationsPanel, speciesPanel, results,
      children: modal, location: modalLocation } = this.props;

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

          <VelocityTransitionGroup runOnMount={true} enter={{ animation: 'fadeIn' }} leave={{ animation: 'fadeOut' }}
            duration={C.TRANSITION_SPEED}>
            {React.cloneElement(modal, { key: modalLocation.pathname })}
          </VelocityTransitionGroup>

          <LocationsPanel
            dispatch={dispatch}
            visible={locationsPanel.visible}
            sort={locationsPanel.sort}
            sortDir={locationsPanel.sortDir}
            filter={locationsPanel.filter}
            locations={results.visibleLocations}
            locationSightings={results.locationSightings}
            locationDataRefreshCounter={results.locationDataRefreshCounter}
            visibleLocationsReturnedCounter={results.visibleLocationsReturnedCounter}
            selectedLocation={locationsPanel.selectedLocation}
            searchSettings={searchSettings}
            env={env} />

          <SpeciesPanel
            dispatch={dispatch}
            visible={speciesPanel.visible}
            locations={results.visibleLocations}
            sightings={results.locationSightings}
            selectedLocation={locationsPanel.selectedLocation}
            searchSettings={searchSettings}
            speciesFilter={speciesPanel.filter}
            env={env}
            sort={speciesPanel.sort}
            sortDir={speciesPanel.sortDir} />
        </section>
      </div>
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
}))(App);

