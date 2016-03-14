import React from 'react';
import ReactDOM from 'react-dom';
import { VelocityComponent } from 'velocity-react';
import { C, E, helpers, _, actions } from '../../core/core';
import { Loader, ClosePanel, LineLoader } from '../general/general';



export class SpeciesPanel extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      nextAnimation: { opacity: this.props.visibility ? 1 : 0 }
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
      animation = { opacity: nextProps.visible ? 1 : 0 };

      if (nextProps.visible) {
        animation = { opacity: 1, height: (env.windowHeight - 85) + 'px' };
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

  getTitle () {
    const { selectedLocation, locations } = this.props;
    if (selectedLocation === '') {
      return (
        <h1>All locations</h1>
      );
    }
    var locationInfo = helpers.getLocationById(locations, selectedLocation);
    return (
      <h2>
        <a href="">All locations</a> &raquo; {locationInfo.n}
      </h2>
    );
  }

  render () {
    const { dispatch, locations, sightings, searchSettings, selectedLocation, env } = this.props;

    if (!locations.length) {
      return null;
    }

    var panelPosition = {
      width: env.windowWidth - C.PANEL_DIMENSIONS.LEFT_PANEL_WIDTH
    };

    var numBirdSpecies = helpers.getUniqueSpeciesInLocationList(locations, sightings, searchSettings.observationRecency);
    //console.log(numBirdSpecies);
    //if (!numBirdSpecies) {
    //  numBirdSpecies = <LineLoader />;
    //}

    var footerStyle = {
      height: C.PANEL_DIMENSIONS.PANEL_FOOTER_HEIGHT + 'px'
    };

    var sightingsData = helpers.getSightings(locations, sightings, searchSettings.observationRecency);

    return (
      <section id="species-panel" style={panelPosition}>
        <header className="section-header" onClick={() => dispatch(actions.togglePanelVisibility(C.PANELS.SPECIES))}>
          <div>
            <h2>Bird species <span className="total-count num-species">{numBirdSpecies}</span></h2>
            <span className="toggle-section glyphicon glyphicon-menu-hamburger" />
          </div>
        </header>

        <VelocityComponent animation={this.state.nextAnimation} duration={C.TRANSITION_SPEED}
          complete={this.transitionComplete.bind(this)} begin={this.transitionBegin.bind(this)}>
          <div id="species-panel-content" ref="panel">
            <div>
              <div className="panel">
                {this.getTitle()}
                <SpeciesTable
                  species={sightingsData}
                  selectedLocation={selectedLocation}
                  observationRecency={searchSettings.observationRecency} />
              </div>
              <footer style={footerStyle} onClick={() => dispatch(actions.togglePanelVisibility(C.PANELS.SPECIES))}>
                <span className="glyphicon glyphicon-triangle-top" />
              </footer>
            </div>
          </div>
        </VelocityComponent>
      </section>
    );
  }
}
SpeciesPanel.PropTypes = {
  visible: React.PropTypes.bool.isRequired,
  locations: React.PropTypes.array.isRequired,
  sightings: React.PropTypes.object.isRequired,
  searchSettings: React.PropTypes.object.isRequired,
  env: React.PropTypes.object.isRequired
};


class SpeciesTable extends React.Component {
  getRows () {
    return _.map(this.props.species, function (speciesInfo) {
      return (<SpeciesRow species={speciesInfo} />);
    });
  }

  render () {
    return (
      <div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Species</th>
              <th>Scientific Name</th>
              <th>Locations Seen</th>
              <th>Last Seen</th>
              <th>Num Reported</th>
            </tr>
          </thead>
          <tbody>
          {this.getRows()}
          </tbody>
        </table>
      </div>
    );
  }
}
SpeciesPanel.PropTypes = {
  species: React.PropTypes.array.isRequired
};


class SpeciesRow extends React.Component {
  render () {
    const { species } = this.props;

    return (
      <tr>
        <td>{species.comName}</td>
        <td>{species.sciName}</td>
        <td>{species.locations.length}</td>
        <td>{species.mostRecentObservationTime}</td>
        <td>{species.howManyCount}</td>
      </tr>
    );
  }
}
