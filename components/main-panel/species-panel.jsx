import React from 'react';
import ReactDOM from 'react-dom';
import { VelocityComponent } from 'velocity-react';
import { C, E, helpers, _, actions } from '../../core/core';
import { Loader, ClosePanel } from '../general/general';



export class SpeciesPanel extends React.Component {
  componentDidMount () {
    $(ReactDOM.findDOMNode(this.refs.panel)).css({ display: 'none' });
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
    const { dispatch, locations, locationSightings, visible, searchSettings, env } = this.props;

    if (!locations.length) {
      return null;
    }

    var panelPosition = {
      width: env.windowWidth - C.PANEL_DIMENSIONS.LEFT_PANEL_WIDTH
    };

    var numBirdSpecies = helpers.getUniqueSpeciesInLocationList(locations, locationSightings, searchSettings.observationRecency);

    var footerStyle = {
      height: C.PANEL_DIMENSIONS.PANEL_FOOTER_HEIGHT + 'px'
    };

    console.log("selected Location: ", this.props.selectedLocation);

    return (
      <section id="species-panel" style={panelPosition}>
        <header className="section-header" onClick={() => dispatch(actions.togglePanelVisibility(C.PANELS.SPECIES))}>
          <div>
            <h2>Bird species <span className="total-count num-species">{numBirdSpecies}</span></h2>
            <span className="toggle-section glyphicon glyphicon-menu-hamburger" />
          </div>
        </header>

        <VelocityComponent animation={{ opacity: visible ? 1 : 0 }} duration={C.TRANSITION_SPEED}
          complete={this.transitionComplete.bind(this)} begin={this.transitionBegin.bind(this)}>
          <div id="species-panel-content" ref="panel">
            <div>
              <div className="panel">
                {this.getTitle()}
                <SpeciesTable
                  locations={locations}
                  sightings={locationSightings} />
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
  env: React.PropTypes.object.isRequired,
  locationSightings: React.PropTypes.object.isRequired,
  observationRecency: React.PropTypes.number.isRequired
};


class SpeciesTable extends React.Component {
  render () {
    return (
      <div></div>
    );
  }
}
