import React from 'react';
import ReactDOM from 'react-dom';
import { FormattedMessage, intlShape } from 'react-intl';
import { VelocityComponent } from 'velocity-react';
import { C, helpers, _, actions } from '../core/core';
import { LineLoader, LocationSpeciesCount } from './general';


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

  shouldComponentUpdate (nextProps) {
    if (this.props.updateCounter === nextProps.updateCounter) {
      return false;
    }

    this.sortedFilteredLocations = helpers.sortLocations(nextProps.locations, nextProps.locationSightings,
      nextProps.searchSettings.observationRecency, nextProps.sort, nextProps.sortDir, nextProps.filter);

    return true;
  }

  componentWillReceiveProps (nextProps) {
    const { visible, env } = this.props;

    var animation = {};
    var hasAnimation = false;

    if (visible !== nextProps.visible) {
      hasAnimation = true;
      animation = { opacity: nextProps.visible ? 1 : 0 };

      if (nextProps.visible) {
        animation = { opacity: 1, height: (env.windowHeight - 85) + 'px' };
      } else {
        animation = { opacity: 0.5, height: 0 };
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

  getTotalSpecies () {
    const { locations, locationSightings, searchSettings } = this.props;
    var results = helpers.getUniqueSpeciesInLocationList(locations, locationSightings, searchSettings.observationRecency);
    return results.count;
  }

  getLocationColSort () {
    const { sort, sortDir } = this.props;
    if (sort !== C.LOCATION_SORT.FIELDS.LOCATION) {
      return null;
    }

    var className = 'col-sort glyphicon ';
    className += (sortDir === C.SORT_DIR.DEFAULT) ? 'glyphicon-triangle-bottom' : 'glyphicon-triangle-top';

    return (
      <span className={className} />
    );
  }

  getNumBirdSpeciesColSort () {
    const { sort, sortDir } = this.props;
    if (sort !== C.LOCATION_SORT.FIELDS.SPECIES) {
      return null;
    }

    var className = 'col-sort glyphicon ';
    className += (sortDir === C.SORT_DIR.DEFAULT) ? 'glyphicon-triangle-bottom' : 'glyphicon-triangle-top';

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
        <p><FormattedMessage id="noLocations" /></p>
      );
    }

    var { dispatch } = this.props;

    return (
      <div id="locations-table-wrapper">
        <table className="table table-striped" >
          <thead>
          <tr>
            <th className="location" onClick={() => dispatch(actions.sortLocations(C.LOCATION_SORT.FIELDS.LOCATION))}>
              <FormattedMessage id="location"/>{this.getLocationColSort()}
            </th>
            <th className="capitalize" onClick={() => dispatch(actions.sortLocations(C.LOCATION_SORT.FIELDS.SPECIES))}>
              <FormattedMessage id="birds"/>{this.getNumBirdSpeciesColSort()}
            </th>
          </tr>
          </thead>
          <tbody onClick={(e) => this.selectLocation(e)}>
            <tr className="all-locations-row" data-location-id="">
              <td className="location"><FormattedMessage id="allLocations" /></td>
              <td className="num-species">
                <LocationSpeciesCount count={this.getTotalSpecies()} />
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
    const { dispatch, locations, locationSightings, filter } = this.props;

    if (!locations.length) {
      return null;
    }

    var numLoadedLocations = helpers.getNumLoadedLocations(locations, locationSightings);

    var loader = null;
    if (numLoadedLocations !== locations.length) {
      loader = <LineLoader className="species-loading" />;
    } else {
      loader = <span className="total-count num-locations">{numLoadedLocations}</span>;
    }

    // height stored in constants so we can compute the various heights dynamically for Velocity
    var footerStyle = {
      height: C.PANEL_DIMENSIONS.PANEL_FOOTER_HEIGHT + 'px'
    };

    return (
      <section id="locations-panel">
        <header className="section-header" onClick={() => dispatch(actions.togglePanelVisibility(C.PANELS.LOCATIONS))}>
          <div>
            <h2>
              <FormattedMessage id="locations" />
              {loader}
            </h2>
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
LocationsPanel.PropTypes = {
  visible: React.PropTypes.bool.isRequired,
  sort: React.PropTypes.string.isRequired,
  sortDir: React.PropTypes.string.isRequired,
  filter: React.PropTypes.string.isRequired,
  locations: React.PropTypes.array.isRequired,
  locationSightings: React.PropTypes.object.isRequired,
  observationRecency: React.PropTypes.number.isRequired,
  env: React.PropTypes.object.isRequired
};


caslkdjalsjd

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
LocationRow.PropTypes = {
  location: React.PropTypes.object.isRequired,
  sightings: React.PropTypes.object.isRequired,
  observationRecency: React.PropTypes.number.isRequired,
  filter: React.PropTypes.string.isRequired
};

