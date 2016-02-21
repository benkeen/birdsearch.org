import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Loader, ClosePanel } from '../general/general';
import Map from '../map/map';
import { VelocityComponent } from 'velocity-react';
import { C, E, _, actions } from '../../core/core';


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
    const { dispatch, env, user, overlayVisibility, mapSettings, searchSettings, panelVisibility, results } = this.props;

    return (
      <section id="mainPanel" className="flex-body">
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
          panelVisibility={panelVisibility}
          locations={results.visibleLocations}
          locationSightings={results.locationSightings}
          searchSettings={searchSettings}
          env={env} />
        <SpeciesPanel
          dispatch={dispatch}
          panelVisibility={panelVisibility} />
      </section>
    );
  }
}

export default connect(state => ({
  env: state.env,
  mapSettings: state.mapSettings,
  searchSettings: state.searchSettings,
  overlayVisibility: state.overlayVisibility,
  panelVisibility: state.panelVisibility,
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


class LocationsPanel extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      nextAnimation: { opacity: this.props.panelVisibility.locations ? 1 : 0 }
    };
  }

  componentDidMount () {
    $(ReactDOM.findDOMNode(this.refs.panel)).css({ display: 'none' });
  }

  componentWillReceiveProps (nextProps) {
    const { panelVisibility, env } = this.props;
    var animation = {};
    var hasAnimation = false;
    if (panelVisibility.locations !== nextProps.panelVisibility.locations) {
      hasAnimation = true;
      animation = { opacity: nextProps.panelVisibility.locations ? 1 : 0 };

      if (nextProps.panelVisibility.locations) {
        animation = { opacity: 1, bottom: 0 };
      } else {
        animation = { opacity: 1, bottom: env.windowHeight - 85 };
      }
    }

    if (hasAnimation) {
      this.setState({ nextAnimation: animation });
    }
  }

  transitionBegin () {
    if (this.props.panelVisibility.locations) {
      $(ReactDOM.findDOMNode(this.refs.panel)).css({ display: 'block' });
    }
  }

  transitionComplete () {
    if (!this.props.panelVisibility.locations) {
      $(ReactDOM.findDOMNode(this.refs.panel)).css({ display: 'none' });
    }
  }

  getLocationRows () {
    return _.map(this.props.locations, function (location) {
      return (
        <LocationRow
          key={location.i}
          location={location}
          sightings={this.props.locationSightings[location.i]}
          observationRecency={this.props.searchSettings.observationRecency} />
      );
    }, this);
  }

  getLocationList () {
    if (!this.props.locations.length) {
      return (
        <p>No locations.</p>
      );
    }
    return (
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Location</th>
            <th>Count</th>
          </tr>
          <tr>
            <td>All locations</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {this.getLocationRows()}
        </tbody>
      </table>
    );
  }

  render () {
    const { dispatch, locations } = this.props;

    if (!locations.length) {
      return null;
    }

    var position = {
      left: C.PANEL_DIMENSIONS.PADDING + 'px',
      top: '85px',
      bottom: 0,
      width: C.PANEL_DIMENSIONS.LEFT_PANEL_WIDTH + 'px'
    };

    return (
      <div>
        <div className="sidebar-header" onClick={() => dispatch(actions.togglePanelVisibility(C.PANELS.LOCATIONS))}>
          <h2>Locations <span className="num-locations">{locations.length}</span></h2>
          <span className="toggle-section glyphicon glyphicon-chevron-down" />
        </div>

        <VelocityComponent animation={this.state.nextAnimation} duration={C.TRANSITION_SPEED}
            complete={this.transitionComplete.bind(this)} begin={this.transitionBegin.bind(this)}>
          <div id="locations-panel" className="panel" ref="panel" style={position}>
            {this.getLocationList()}
          </div>
        </VelocityComponent>
      </div>
    );
  }
}
LocationsPanel.PropTypes = {
  visible: React.PropTypes.bool.isRequired,
  locations: React.PropTypes.array.isRequired,
  env: React.PropTypes.object.isRequired
};


class LocationRow extends React.Component {
  render () {
    var counter = (this.props.sightings.fetched) ? this.props.sightings.data[this.props.observationRecency - 1].numSpeciesRunningTotal : ' - ';
    return (
      <tr>
        <td>{this.props.location.n}</td>
        <td>{counter}</td>
      </tr>
    );
  }
}
LocationRow.PropTypes = {
  location: React.PropTypes.object.isRequired,
  sightings: React.PropTypes.object.isRequired,
  observationRecency: React.PropTypes.number.isRequired
};


class SpeciesPanel extends React.Component {
  componentDidMount () {
    $(ReactDOM.findDOMNode(this.refs.panel)).css({ display: 'none' });
  }

  transitionBegin () {
    if (this.props.panelVisibility.species) {
      $(ReactDOM.findDOMNode(this.refs.panel)).css({ display: 'block' });
    }
  }

  transitionComplete () {
    if (!this.props.panelVisibility.species) {
      $(ReactDOM.findDOMNode(this.refs.panel)).css({ display: 'none' });
    }
  }

  render () {
    const { dispatch, panelVisibility } = this.props;

    var position = {
      left: C.PANEL_DIMENSIONS.LEFT_PANEL_WIDTH + (2 * C.PANEL_DIMENSIONS.PADDING) + 'px',
      top: C.PANEL_DIMENSIONS.TOP + 'px',
      bottom: C.PANEL_DIMENSIONS.PADDING + 'px',
      right: C.PANEL_DIMENSIONS.PADDING + 'px'
    };

    return (
      <VelocityComponent animation={{ opacity: panelVisibility.species ? 1 : 0 }} duration={C.TRANSITION_SPEED}
        complete={this.transitionComplete.bind(this)} begin={this.transitionBegin.bind(this)}>
        <div id="species-panel" className="panel" ref="panel" style={position}>
          <ClosePanel onClose={() => dispatch(actions.togglePanelVisibility(C.PANELS.SPECIES))} />
        </div>
      </VelocityComponent>
    );
  }
}
SpeciesPanel.PropTypes = {
  visible: React.PropTypes.bool.isRequired
};
