import React from 'react';
import ReactDOM from 'react-dom';
import { VelocityComponent } from 'velocity-react';
import { C, E, _, actions } from '../../core/core';
import { Loader, ClosePanel } from '../general/general';



export class LocationsPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nextAnimation: {opacity: this.props.panelVisibility.locations ? 1 : 0}
    };
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.panel)).css({display: 'none'});
  }

  componentWillReceiveProps(nextProps) {
    const { panelVisibility, env } = this.props;
    var animation = {};
    var hasAnimation = false;
    if (panelVisibility.locations !== nextProps.panelVisibility.locations) {
      hasAnimation = true;
      animation = { opacity: nextProps.panelVisibility.locations ? 1 : 0};

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
          observationRecency={this.props.searchSettings.observationRecency}/>
      );
    }, this);
  }

  getTotalLocations () {
    return null;
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
          <th className="location">Location</th>
          <th>Count</th>
        </tr>
        <tr>
          <td className="location">All locations</td>
          <td>{this.getTotalLocations()}</td>
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

    return (
      <section id="locations-panel">
        <header className="section-header" onClick={() => dispatch(actions.togglePanelVisibility(C.PANELS.LOCATIONS))}>
          <div>
            <h2>Locations <span className="total-count num-locations">{locations.length}</span></h2>
            <span className="toggle-section glyphicon glyphicon-chevron-down" />
          </div>
        </header>

        <VelocityComponent animation={this.state.nextAnimation} duration={C.TRANSITION_SPEED}
           complete={this.transitionComplete.bind(this)} begin={this.transitionBegin.bind(this)}>
          <div className="panel" ref="panel">
            {this.getLocationList()}
          </div>
        </VelocityComponent>
      </section>
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
        <td className="location">{this.props.location.n}</td>
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
