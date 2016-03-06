import React from 'react';
import ReactDOM from 'react-dom';
import { VelocityComponent } from 'velocity-react';
import { C, E, helpers, _, actions } from '../../core/core';
import { Loader, ClosePanel } from '../general/general';



export class LocationsPanel extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      nextAnimation: { opacity: this.props.visibility ? 1 : 0}
    };
  }

  componentDidMount () {
    $(ReactDOM.findDOMNode(this.refs.panel)).css({ display: 'none' });
  }

  componentWillReceiveProps (nextProps) {
    const { visible, env } = this.props;
    var animation = {};
    var hasAnimation = false;
    if (visible !== nextProps.visible) {
      hasAnimation = true;
      animation = { opacity: nextProps.visible ? 1 : 0};

      if (nextProps.visible) {
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
      return (
        <LocationRow
          key={location.i}
          location={location}
          sightings={this.props.locationSightings[location.i]}
          observationRecency={this.props.searchSettings.observationRecency}/>
      );
    }, this);
  }

  getTotalLocations () {
    var loaded = _.every(this.props.locations, function (location) {
      return this.props.locationSightings[location.i].fetched;
    }, this);

    if (!loaded) {
      return (
        <span>-</span>
      );
    }

    return helpers.getUniqueSpeciesInLocationList(this.props.locations, this.props.locationSightings, this.props.searchSettings.observationRecency);
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
          <th className="location" onClick={() => dispatch(actions.sortLocations(C.LOCATION_SORT.FIELDS.LOCATION))}>Location</th>
          <th onClick={() => dispatch(actions.sortLocations(C.LOCATION_SORT.FIELDS.SPECIES))}>Birds</th>
        </tr>
        </thead>
        <tbody>
          <tr className="all-locations-row">
            <td className="location">All locations</td>
            <td className="num-species">
              <LocationSpeciesCount count={this.getTotalLocations()} />
            </td>
          </tr>
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
          <div ref="panel">
            <div className="panel">
              <div className="filter-locations-row">
                <input type="text" placeholder="Filter Locations" />
              </div>
              {this.getLocationList()}
            </div>
            <footer onClick={() =>  dispatch(actions.togglePanelVisibility(C.PANELS.LOCATIONS))}>
              <span className="glyphicon glyphicon-triangle-top"></span>
            </footer>
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
  locations: React.PropTypes.array.isRequired,
  observationRecency: React.PropTypes.number.isRequired,
  env: React.PropTypes.object.isRequired
};


class LocationRow extends React.Component {
  render () {
    var count = null;
    var rowClass = 'loading';
    if (this.props.sightings.fetched) {
      count = this.props.sightings.data[this.props.observationRecency - 1].numSpeciesRunningTotal
      rowClass = '';
    }

    return (
      <tr className={rowClass}>
        <td className="location">{this.props.location.n}</td>
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
  observationRecency: React.PropTypes.number.isRequired
};


// draws a pretty count element with the appropriate colour for the # of species
class LocationSpeciesCount extends React.Component {
  render () {
    if (this.props.count === null) {
      return <span> - </span>;
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
