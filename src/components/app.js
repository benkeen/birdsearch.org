import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { VelocityTransitionGroup } from 'velocity-react';
import { C, _, actions } from '../core/core';
import Header from './header';
import { Map } from './map';
import { Loader } from './general';
import { LocationsPanel } from './locations';
import { SightingsPanel } from './sightings';
import IntroOverlay from './intro';


// this is our top-level component. It contains the header, map and controls. The router passes in other components as
// children (e.g /about, /advanced-search and so on). They are all overlays. The default overlay for the site is the
// intro overlay
class App extends React.Component {
	constructor(props) {
		super(props);
		this.onResize = this.onResize.bind(this);
		this.getModal = this.getModal.bind(this);

		// trigger the resize so everything's initialized on page load
		this.onResize();
	}

	componentDidMount() {
		$(window).resize(this.onResize);
	}

	// our global window resize listener
	onResize() {
		var windowHeight = $(window).height();
		var windowWidth = $(window).width();
		this.props.dispatch(actions.onWindowResize(windowWidth, windowHeight));
	}

	getModal() {
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

		// hack. The transition
		let isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
		const duration = (isFirefox) ? 1 : C.TRANSITION_SPEED;

		return (
		<VelocityTransitionGroup runOnMount={true} component="div"
								 enter={{ animation: 'fadeIn', duration: duration }}
								 leave={{ animation: 'fadeOut', duration: duration }}>
			{modal ? React.cloneElement(modal, { key: location.pathname }) : undefined}
		</VelocityTransitionGroup>
		);
	}

	render() {
		const {
		dispatch, env, mapSettings, searchSettings, locationsPanel, sightingsPanel, results,
		showScientificName, mapStyle, user, intl
		} = this.props;

		const classes = 'flex-body' + (results.visibleLocations.length > 0 ? ' has-results' : '');
		return (
		<div id="page-wrapper">
			<Header />
			<div id="mobile-search-row"></div>

			<section id="main-panel" className={classes}>
				<Map
				dispatch={dispatch}
				env={env}
				lat={mapSettings.lat}
				lng={mapSettings.lng}
				searchUpdateCounter={mapSettings.searchUpdateCounter}
				resetSearchCounter={mapSettings.resetSearchCounter}
				mapTypeId={mapSettings.mapTypeId}
				bounds={mapSettings.bounds}
				searchSettings={searchSettings}
				results={results}
				intl={intl}
				locationFilter={locationsPanel.filter}
				mapStyle={mapStyle}
				locale={user.locale}/>

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
				env={env}/>

				<SightingsPanel
				dispatch={dispatch}
				visible={sightingsPanel.visible}
				updateCounter={sightingsPanel.updateCounter}
				locations={results.visibleLocations}
				sightings={results.locationSightings}
				selectedLocation={locationsPanel.selectedLocation}
				searchSettings={searchSettings}
				speciesFilter={sightingsPanel.filter}
				showScientificName={showScientificName}
				env={env}
				intl={intl}
				results={results}
				sort={sightingsPanel.sort}
				sortDir={sightingsPanel.sortDir}/>
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
	sightingsPanel: state.sightingsPanel,
	mapStyle: state.settingsOverlay.mapStyle,
	showScientificName: state.settingsOverlay.showScientificName,
	user: state.user,
	results: state.results
}))(App));


class DataLoader extends React.Component {
	render() {
		return (
		<div id="data-loader" className="overlay">
			<Loader label=""/>
		</div>
		);
	}
}
