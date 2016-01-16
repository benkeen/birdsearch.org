import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Loader, ClosePanel } from '../general/general';
import Map from '../map/map';
import { VelocityComponent } from 'velocity-react';
import { C, E, _, actions } from '../../core/core';


class MainPanel extends React.Component {
  render () {
    const { dispatch, isRequestingUserLocation, overlayVisibility, mapSettings, searchSettings, panelVisibility, results } = this.props;

    return (
      <section id="mainPanel" className="flex-body">
        <Map
          dispatch={dispatch}
          zoom={mapSettings.zoom}
          lat={mapSettings.lat}
          lng={mapSettings.lng}
          mapTypeId={mapSettings.mapTypeId}
          bounds={mapSettings.bounds}
          results={results} />

        <IntroOverlay
          visible={overlayVisibility.intro}
          loading={isRequestingUserLocation}
          onClose={() => dispatch(actions.setIntroOverlayVisibility(false))}
          searchNearby={() => dispatch(actions.getGeoLocation({
            searchType: searchSettings.searchType,
            observationRecency: searchSettings.observationRecency
          }))}
          searchAnywhere={() => dispatch(actions.setIntroOverlayVisibility(false))} />

        <AdvancedSearchOverlay />

        <div id="map-panels">
          <div id="panels">
            <div id="left-panel">
              <OverviewPanel
                dispatch={dispatch}
                visible={panelVisibility.overview}
                numLocations={results.allLocations.length} />
              <LocationsPanel
                dispatch={dispatch}
                visible={panelVisibility.locations}
                locations={results.visibleLocations} />
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
  searchSettings: state.searchSettings,
  overlayVisibility: state.overlayVisibility,
  panelVisibility: state.panelVisibility,
  isRequestingUserLocation: state.userLocation.isFetching,
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
  constructor (props) {
    super(props);
  }

  transitionBegin () {
    if (this.props.visible) {
      $(ReactDOM.findDOMNode(this.refs.panel)).css({ display: 'block' });
    }
  }

  transitionComplete () {
    if (!this.props.visible) {
      $(ReactDOM.findDOMNode(this.refs.panel)).css({ display: 'none' });
    }
  }

  render () {
    const { dispatch, visible, numLocations } = this.props;

    return (
      <VelocityComponent animation={{ opacity: visible ? 1 : 0, height: visible ? 115 : 0 }} duration={C.TRANSITION_SPEED}
         complete={this.transitionComplete.bind(this)} begin={this.transitionBegin.bind(this)}>
        <div id="overview-panel" ref="panel">
          <div className="panel">
            <ClosePanel onClose={() => dispatch(actions.togglePanelVisibility(C.PANELS.OVERVIEW))} />
            <h1>
              Locations: <span className="num-locations">{numLocations}</span>
            </h1>
            <h1>
              Species: <span className="num-species">0</span>
            </h1>
          </div>
        </div>
      </VelocityComponent>
    );
  }
}
OverviewPanel.PropTypes = {
  visible: React.PropTypes.bool.isRequired,
  numLocations: React.PropTypes.number.isRequired
};


class LocationsPanel extends React.Component {
  transitionBegin () {
    if (this.props.visible) {
      $(ReactDOM.findDOMNode(this.refs.panel)).css({ display: 'block' });
    }
  }

  transitionComplete () {
    if (!this.props.visible) {
      $(ReactDOM.findDOMNode(this.refs.panel)).css({ display: 'none' });
    }
  }

  getLocationRows () {
    return _.map(this.props.locations, function (location) {
      return (<LocationRow location={location} key={location.i} />);
    });
  }

  getLocationList () {
    if (!this.props.locations.length) {
      return (
        <p>No locations.</p>
      );
    }
    return (
      <table>
        <thead>
          <tr>
            <th>Location</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {this.getLocationRows()}
        </tbody>
      </table>
    );
  }

  /*
  var _generateAsyncSidebarTable = function(visibleHotspots) {
    var templateData = [];
    for (var i=0; i<_numVisibleLocations; i++) {
      var row = _visibleLocations[i];

      var currLocationID = _visibleLocations[i].locationID;
      row.rowClass = "";
      row.numSpeciesWithinRange = "";

      if (!_birdSearchHotspots[currLocationID].hasOwnProperty("sightings") || !_birdSearchHotspots[currLocationID].sightings.data[_lastSearchObsRecency-1].available) {
        row.rowClass = "notLoaded";
      } else {
        row.numSpeciesWithinRange = _birdSearchHotspots[currLocationID].sightings.data[_lastSearchObsRecency-1].numSpeciesRunningTotal;
      }
      templateData.push(row);
    }

    // add the table to the page
    var tmpl = _.template(sidebarResultsTableTemplate, {
      L: _L,
      asyncLoading: true,
      showSpeciesColumn: true,
      hotspots: templateData
    });
    $("#sidebarResults").html(tmpl).removeClass("hidden").css({height: _getSidebarResultsPanelHeight() }).fadeIn(300);

    // instantiate any spinners for rows that haven't loaded yet
    var notLoaded = $(".notLoaded .speciesCount");
    for (var i=0; i<notLoaded.length; i++) {
      Spinners.create($(notLoaded[i])[0], {
        radius: 3,
        height: 4,
        width: 1.4,
        dashes: 12,
        opacity: 1,
        padding: 0,
        rotation: 1400,
        fadeOutSpeed: 0,
        color: "#222222"
      }).play();
    }

    _getBirdHotspotObservations();
  };
  */

  render () {
    const { dispatch, visible } = this.props;
    return (
      <VelocityComponent animation={{ opacity: visible ? 1 : 0 }} duration={C.TRANSITION_SPEED}
          complete={this.transitionComplete.bind(this)} begin={this.transitionBegin.bind(this)}>
        <div id="locations-panel" className="panel" ref="panel">
          <ClosePanel onClose={() => dispatch(actions.togglePanelVisibility(C.PANELS.LOCATIONS))} />
          {this.getLocationList()}
        </div>
      </VelocityComponent>
    );
  }
}

LocationsPanel.PropTypes = {
  visible: React.PropTypes.bool.isRequired,
  locations: React.PropTypes.array.isRequired
};


class LocationRow extends React.Component {
  render () {
    return (
      <tr>
        <td>{this.props.location.n}</td>
        <td>?</td>
      </tr>
    );
  }
}


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
