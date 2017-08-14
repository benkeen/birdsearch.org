import React from 'react';
import { connect } from 'react-redux';
import { VelocityTransitionGroup } from 'velocity-react';
import { C, actions } from '../core/core';
import './global-styles';
import Header from './header';
import Map from './map/map';
import { Loader } from './general/general';
import { LocationsPanel } from './locations/locations';
import { SightingsPanel } from './sightings/sightings';
import IntroOverlay from './modals/intro';


// this is our top-level component. It contains the header, map and controls. The router passes in other components as
// children (e.g /about, /advanced-search and so on). They are all overlays. The default overlay for the site is the
// intro overlay
class App extends React.Component {
  constructor (props) {
    super(props);
    this.onResize = this.onResize.bind(this);
    this.getModal = this.getModal.bind(this);

    // trigger the resize so everything's initialized on page load
    this.onResize();
  }

  componentDidMount () {
    $(window).resize(this.onResize);
  }

  // our global window resize listener
  onResize () {
    const windowHeight = $(window).height();
    const windowWidth  = $(window).width();
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

  render () {
    const { results } = this.props;
    const classes = 'flex-body' + (results.visibleLocations.length > 0 ? ' has-results' : '');

    return (
      <div id="page-wrapper">
        <Header />
        <div id="mobile-search-row"></div>
        <section id="main-panel" className={classes}>
          <Map />
          {this.getModal()}
          <LocationsPanel />
          <SightingsPanel />
        </section>
      </div>
    );
  }
}

export default connect(state => ({
  introOverlay: state.introOverlay,
  results: state.results
}))(App);


const DataLoader = () => (
  <div id="data-loader" className="overlay">
    <Loader label="" />
  </div>
);
