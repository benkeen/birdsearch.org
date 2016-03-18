import React from 'react';
import ReactDOM from 'react-dom';
import { VelocityComponent } from 'velocity-react';
import { C, E, helpers, _, actions } from '../../core/core';
import { Loader, ClosePanel, LineLoader } from '../general/general';



export class LocationsPanel extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      nextAnimation: { opacity: this.props.visibility ? 1 : 0 },
      sortedFilteredLocations: []
    };
  }

  componentDidMount () {
    $(ReactDOM.findDOMNode(this.refs.panel)).css({ display: 'none' });
  }

  componentWillReceiveProps (nextProps) {
    const { visible, env, locations, locationSightings, sort, sortDir, filter, searchSettings } = this.props;

    var animation = {};
    var hasAnimation = false;

    if (visible !== nextProps.visible) {
      hasAnimation = true;
      animation = { opacity: nextProps.visible ? 1 : 0 };

      if (nextProps.visible) {
        animation = { opacity: 1, height: (env.windowHeight - 85) + 'px' }; // TODO
      } else {
        animation = { opacity: 0, height: 0 };
      }
    }

    // this resizes the visible location panel whenever the browser height changes
    if (nextProps.env.windowHeight !== env.windowHeight && visible) {
      hasAnimation = true;
      animation = { height: (nextProps.env.windowHeight - 85) + 'px' };
    }

    if (hasAnimation) {
      this.setState({ nextAnimation: animation });
    }

    // to cut down on unnecessary processing, we only re-sort the locations when necessary
    var resortLocations = false;
    if (nextProps.sort !== sort || nextProps.sortDir !== sortDir) {
      resortLocations = true;
    }

    if (nextProps.visibleLocationsReturnedCounter !== this.props.visibleLocationsReturnedCounter) {
      resortLocations = true;
    }

    // if the user is sorting by species and a new location's sightings was returned, we'll need to sort then as well
    if (nextProps.sort === C.LOCATION_SORT.FIELDS.SPECIES && nextProps.locationDataRefreshCounter !== this.props.locationDataRefreshCounter) {
      resortLocations = true;
    }

    if (resortLocations) {
      var sortedFilteredLocations = helpers.sortLocations(nextProps.locations, nextProps.locationSightings,
        nextProps.searchSettings.observationRecency, nextProps.sort, nextProps.sortDir, nextProps.filter);

      this.sortedFilteredLocations = sortedFilteredLocations;
    }
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

  getLocationRows () {
    const { locationSightings, filter, searchSettings } = this.props;

    return _.map(this.sortedFilteredLocations, function (location) {
      return (
        <LocationRow
          key={location.i}
          filter={filter}
          location={location}
          sightings={locationSightings[location.i]}
          observationRecency={searchSettings.observationRecency}/>
      );
    }, this);
  }

  getTotalLocations () {
    const { locations, locationSightings, searchSettings } = this.props;
    return helpers.getUniqueSpeciesInLocationList(locations, locationSightings, searchSettings.observationRecency);
  }

  getLocationColSort () {
    const { sort, sortDir } = this.props;
    if (sort !== C.LOCATION_SORT.FIELDS.LOCATION) {
      return null;
    }

    var className = 'col-sort glyphicon ';
    className += (sortDir === C.LOCATION_SORT.DIR.DEFAULT) ? 'glyphicon-triangle-bottom' : 'glyphicon-triangle-top';

    return (
      <span className={className} />
    );
  }

  selectLocation (e) {
    this.props.dispatch(actions.selectLocation($(e.target).closest('tr').data('locationId')));
    this.props.dispatch(actions.showSpeciesPanel());
  }

  getLocationList () {
    if (!this.props.locations.length) {
      return (
        <p>No locations.</p>
      );
    }

    var { dispatch } = this.props;

    return (
      <div id="locations-table-wrapper">
        <table className="table table-striped" >
          <thead>
          <tr>
            <th className="location" onClick={() => dispatch(actions.sortLocations(C.LOCATION_SORT.FIELDS.LOCATION))}>
              Location {this.getLocationColSort()}
            </th>
            <th onClick={() => dispatch(actions.sortLocations(C.LOCATION_SORT.FIELDS.SPECIES))}>
              Birds
            </th>
          </tr>
          </thead>
          <tbody onClick={(e) => this.selectLocation(e)}>
            <tr className="all-locations-row" data-location-id="">
              <td className="location">All locations</td>
              <td className="num-species">
                <LocationSpeciesCount count={this.getTotalLocations()} />
              </td>
            </tr>
            {this.getLocationRows()}
          </tbody>
        </table>
      </div>
    );
  }

  getClearLocationFilterIcon () {
    const { dispatch, filter } = this.props;

    if (!filter) {
      return;
    }
    return (
      <span className="clear-filter-icon glyphicon glyphicon-remove" onClick={() => dispatch(actions.setLocationFilter(''))} />
    );
  }

  render () {
    const { dispatch, locations, filter } = this.props;

    if (!locations.length) {
      return null;
    }

    // height stored in constants so we can compute the various heights dynamically for velocity
    var footerStyle = {
      height: C.PANEL_DIMENSIONS.PANEL_FOOTER_HEIGHT + 'px'
    };

    return (
      <section id="locations-panel">
        <header className="section-header" onClick={() => dispatch(actions.togglePanelVisibility(C.PANELS.LOCATIONS))}>
          <div>
            <h2>Locations <span className="total-count num-locations">{locations.length}</span></h2>
            <span className="toggle-section glyphicon glyphicon-menu-hamburger" />
          </div>
        </header>

        <VelocityComponent animation={this.state.nextAnimation} duration={C.TRANSITION_SPEED}
          complete={this.transitionComplete.bind(this)} begin={this.transitionBegin.bind(this)}>
          <div id="locations-panel-content" ref="panel">
            <div>
              <div className="panel">
                <div className="filter-locations-row">
                  <input type="text" placeholder="Filter Locations" className="filter-field" value={filter}
                    onChange={(e) => dispatch(actions.setLocationFilter(e.target.value))} />
                  {this.getClearLocationFilterIcon()}
                </div>
                {this.getLocationList()}
              </div>
              <footer style={footerStyle} onClick={() => dispatch(actions.togglePanelVisibility(C.PANELS.LOCATIONS))}>
                <span className="glyphicon glyphicon-triangle-top" />
              </footer>
            </div>
          </div>
        </VelocityComponent>
      </section>
    );
  }
}
//LocationsPanel.PropTypes = {
//  visible: React.PropTypes.bool.isRequired,
//  sort: React.PropTypes.string.isRequired,
//  sortDir: React.PropTypes.string.isRequired,
//  filter: React.PropTypes.string.isRequired,
//  locations: React.PropTypes.array.isRequired,
//  locationSightings: React.PropTypes.object.isRequired,
//  observationRecency: React.PropTypes.number.isRequired,
//  env: React.PropTypes.object.isRequired
//};


class LocationRow extends React.Component {
  render () {
    const { sightings, observationRecency, filter, location } = this.props;

    var count = null;
    var rowClass = 'loading';
    if (sightings.fetched) {
      count = sightings.data[observationRecency - 1].numSpeciesRunningTotal;
      rowClass = '';
    }

    var locationNameData = helpers.highlightString(location.n, filter);
    return (
      <tr className={rowClass} data-location-id={location.i}>
        <td className="location">
          <div title={location.n} dangerouslySetInnerHTML={{ __html: locationNameData.string }}></div>
        </td>
        <td className="num-species">
          <LocationSpeciesCount count={count} />
        </td>
      </tr>
    );
  }
}
//LocationRow.PropTypes = {
//  location: React.PropTypes.object.isRequired,
//  sightings: React.PropTypes.object.isRequired,
//  observationRecency: React.PropTypes.number.isRequired,
//  filter: React.PropTypes.string.isRequired
//};


// draws a pretty count element with the appropriate colour for the # of species
class LocationSpeciesCount extends React.Component {
  render () {
    if (this.props.count === null) {
      return (<span>...</span>);
    }

    var className = 'range ';
    if (this.props.count < 10) {
      className += 'range1';
    } else if (this.props.count < 20) {
      className += 'range2';
    } else if (this.props.count < 30) {
      className += 'range3';
    } else if (this.props.count < 40) {
      className += 'range4';
    } else if (this.props.count < 50) {
      className += 'range5';
    } else if (this.props.count < 60) {
      className += 'range6';
    } else if (this.props.count < 70) {
      className += 'range7';
    } else {
      className += 'range8';
    }

    return (
      <span className={className}>{this.props.count}</span>
    );
  }
}
LocationRow.PropTypes = {
  //count: React.PropTypes.number.isRequired // or null
};
