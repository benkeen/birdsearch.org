import React from 'react';
import ReactDOM from 'react-dom';
import { VelocityComponent } from 'velocity-react';
import { C, E, helpers, _, actions } from '../../core/core';
import { Loader, ClosePanel, LocationsDropdown, LineLoader } from '../general/general';
import { OverlayTrigger, Popover } from 'react-bootstrap';


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
    const { locations, selectedLocation } = this.props;

    var title = 'All Locations';
    if (selectedLocation) {
      var locationInfo = helpers.getLocationById(locations, selectedLocation);
      title = locationInfo.n;
    }

    return (
      <div className="species-heading-row">
        <h1>{title}</h1>
      </div>
    );
  }

  render () {
    const { dispatch, locations, sightings, searchSettings, selectedLocation, speciesFilter, env } = this.props;

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

    var sightingsData = [];
    if (selectedLocation) {
      sightingsData = helpers.getSightings(locations, sightings, searchSettings.observationRecency, selectedLocation);
    } else {
      sightingsData = helpers.getSightings(locations, sightings, searchSettings.observationRecency);
    }

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
                  dispatch={dispatch}
                  species={sightingsData}
                  selectedLocation={selectedLocation}
                  observationRecency={searchSettings.observationRecency}
                  filter={speciesFilter} />
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
  speciesFilter: React.PropTypes.string.isRequired,
  env: React.PropTypes.object.isRequired
};


class SpeciesTable extends React.Component {
  getRows () {
    const { species, filter } = this.props;

    return _.map(species, function (speciesInfo, index) {
      return (
        <SpeciesRow
          filter={filter}
          species={speciesInfo}
          rowNum={index+1}
          key={index} />
      );
    });
  }

  getClearSpeciesFilterIcon () {
    const { dispatch, filter } = this.props;
    if (!filter) {
      return;
    }
    return (
      <span className="clear-filter-icon glyphicon glyphicon-remove" onClick={() => dispatch(actions.setSpeciesFilter(''))} />
    );
  }

  render () {
    const { filter, dispatch } = this.props;

    return (
      <div className="species-table">
        <table className="table table-striped">
          <thead>
            <tr>
              <th className="row-num"></th>
              <th className="species-col">
                <span>Species</span>
                <input type="text" placeholder="Filter Species" className="filter-field" value={filter}
                   onChange={(e) => dispatch(actions.setSpeciesFilter(e.target.value))} />
                {this.getClearSpeciesFilterIcon()}
              </th>
              <th className="locations-seen">Locations Seen</th>
              <th className="last-seen">Last Seen</th>
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
SpeciesTable.PropTypes = {
  species: React.PropTypes.array.isRequired,
  filter: React.PropTypes.string.isRequired
};


class SpeciesRow extends React.Component {
  render () {
    const { species, filter, rowNum } = this.props;

    var comNameData = helpers.highlightString(species.comName, filter);
    var sciNameData = helpers.highlightString(species.sciName, filter);

    if (!comNameData.match && !sciNameData.match) {
      return null;
    }

    var popover = <LocationsPopover locations={species.locations} />

    return (
      <tr>
        <td className="row-num">{rowNum}</td>
        <td>
          <div className="com-name" dangerouslySetInnerHTML={{ __html: comNameData.string }}></div>
          <div className="sci-name" dangerouslySetInnerHTML={{ __html: sciNameData.string }}></div>
        </td>
        <td>
          <span >
          <OverlayTrigger trigger="click" placement="bottom" overlay={popover} container={''}>
            <span className="num-locations">{species.locations.length}</span>
          </OverlayTrigger>
          </span>
        </td>
        <td>{species.mostRecentObservationTime}</td>
        <td>{species.howManyCount}</td>
      </tr>
    );
  }
}


class LocationsPopover extends React.Component {
  getLocations () {
    return _.map(this.props.locations, function (location) {
      console.log(location);

      return (<li>{location.n}</li>);
    });
  }
  render () {
    return (
      <Popover title="Locations" id="popover">
        <ul>
          {this.getLocations()}
        </ul>
      </Popover>
    );
  }
}
SpeciesTable.PropTypes = {
  locations: React.PropTypes.array.isRequired
};

