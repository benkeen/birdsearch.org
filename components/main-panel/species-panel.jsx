import React from 'react';
import ReactDOM from 'react-dom';
import { VelocityComponent } from 'velocity-react';
import { C, E, helpers, _, actions } from '../../core/core';
import { Loader, ClosePanel, LocationsDropdown, LineLoader, LocationSpeciesCount } from '../general/general';
import { Overlay, OverlayTrigger, Popover } from 'react-bootstrap';


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
    const { dispatch, locations, selectedLocation, searchSettings, sightings } = this.props;

    var title = 'All Locations';
    var counter = null;
    if (selectedLocation) {
      var locationInfo = helpers.getLocationById(locations, selectedLocation);

      if (sightings[selectedLocation].fetched) {
        var numSpecies = sightings[selectedLocation].data[searchSettings.observationRecency-1].numSpeciesRunningTotal;
        counter = <LocationSpeciesCount count={numSpecies} />;
      }

      title = (
        <span>
          <a href="#" onClick={(e) => { e.preventDefault(); dispatch(actions.selectLocation('')); }}>All Locations</a>
          <span className="delimiter glyphicon glyphicon-triangle-right"></span>
          <span>{locationInfo.n}</span>
        </span>
      );
    }

    return (
      <div className="species-heading-row">
        <h1>{title}</h1>
        {counter}
      </div>
    );
  }

  render () {
    const { dispatch, locations, sightings, searchSettings, selectedLocation, speciesFilter, env,
      sort, sortDir } = this.props;

    if (!locations.length) {
      return null;
    }

    var panelPosition = {
      width: env.windowWidth - C.PANEL_DIMENSIONS.LEFT_PANEL_WIDTH
    };

    var results = helpers.getUniqueSpeciesInLocationList(locations, sightings, searchSettings.observationRecency);
    var numBirdSpecies = results.count;

    var loader = null;
    if (!results.allFetched) {
      loader = <LineLoader className="species-loading" />;
    }

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
            <h2>
              Bird species
              <span className="total-count num-species">{numBirdSpecies}</span>
              {loader}
            </h2>
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
                  filter={speciesFilter}
                  sort={sort}
                  sortDir={sortDir} />
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
  getContent () {
    const { species } = this.props;

    if (!species.length) {
      return null;
    }

    return (
      <tbody>
        {this.getRows()}
      </tbody>
    )
  }

  getRows () {
    const { dispatch, species, filter } = this.props;

    return _.map(species, function (speciesInfo, index) {
      var comNameData = helpers.highlightString(speciesInfo.comName, filter);
      var sciNameData = helpers.highlightString(speciesInfo.sciName, filter);
      if (!comNameData.match && !sciNameData.match) {
        return null;
      }

      return (
        <SpeciesRow
          dispatch={dispatch}
          filter={filter}
          species={speciesInfo}
          rowNum={index+1}
          comName={comNameData.string}
          sciName={sciNameData.string}
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

  getSpeciesColSort (field) {
    const { sort, sortDir } = this.props;
    if (sort !== field) {
      return null;
    }

    var className = 'col-sort glyphicon ';
    className += (sortDir === C.SORT_DIR.DEFAULT) ? 'glyphicon-triangle-bottom' : 'glyphicon-triangle-top';

    return (
      <span className={className} />
    );
  }

  render () {
    const { filter, dispatch } = this.props;

    return (
      <div className="species-table">
        <table className="species-table-header table table-striped">
          <thead>
            <tr>
              <th className="row-num"></th>
              <th className="species-col">
                <span onClick={() => dispatch(actions.sortSpecies(C.SPECIES_SORT.FIELDS.SPECIES))}>
                  <span className="species-header">Species</span>
                  {this.getSpeciesColSort(C.SPECIES_SORT.FIELDS.SPECIES)}
                </span>
                <input type="text" placeholder="Filter Species" className="filter-field" value={filter}
                  onChange={(e) => dispatch(actions.setSpeciesFilter(e.target.value))} />
                {this.getClearSpeciesFilterIcon()}
              </th>
              <th className="locations-seen" onClick={() => dispatch(actions.sortSpecies(C.SPECIES_SORT.FIELDS.NUM_LOCATIONS))}>
                Locations Seen
                {this.getSpeciesColSort(C.SPECIES_SORT.FIELDS.NUM_LOCATIONS)}
              </th>
              <th className="last-seen" onClick={() => dispatch(actions.sortSpecies(C.SPECIES_SORT.FIELDS.LAST_SEEN))}>
                Last Seen
                {this.getSpeciesColSort(C.SPECIES_SORT.FIELDS.LAST_SEEN)}
              </th>
              <th className="num-reported" onClick={() => dispatch(actions.sortSpecies(C.SPECIES_SORT.FIELDS.NUM_REPORTED))}>
                Num Reported
                {this.getSpeciesColSort(C.SPECIES_SORT.FIELDS.NUM_REPORTED)}
              </th>
            </tr>
          </thead>
        </table>
        <div className="species-table-content-wrapper">
          <table className="species-table-content table table-striped">
            {this.getContent()}
          </table>
        </div>
      </div>
    );
  }
}
SpeciesTable.PropTypes = {
  species: React.PropTypes.array.isRequired,
  filter: React.PropTypes.string.isRequired,
//  selectedLocation: React.propTypes.string.isRequired,
//  observationRecency: React.propTypes.number.isRequired,
  sort: React.PropTypes.string.isRequired,
  sortDir: React.PropTypes.string.isRequired
};


class SpeciesRow extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      show: false
    };
  }

  selectLocation (dispatch, el) {
    $('body').trigger('click');
    var locationID = $(el).data('id');
    dispatch(actions.selectLocation(locationID));
  }

  getLocations () {
    return _.map(this.props.species.locations, function (locInfo) {
      return (<li key={locInfo.locID} data-id={locInfo.locID}>{locInfo.locName}</li>);
    });
  }

  render () {
    const { dispatch, species, comName, sciName, rowNum } = this.props;
    var locations = this.getLocations();

    return (
      <tr>
        <td className="row-num">{rowNum}</td>
        <td className="species-col">
          <div className="com-name" dangerouslySetInnerHTML={{ __html: comName }}></div>
          <div className="sci-name" dangerouslySetInnerHTML={{ __html: sciName }}></div>
        </td>
        <td ref="cell" className="locations-seen species-num-locations-cell">
          <OverlayTrigger trigger="click" placement="bottom" rootClose={true} show={this.state.show} container={this.refs.cell}
            overlay={
              <Popover title="Locations" id="locations-popover">
                <ul onClick={(e) => this.selectLocation(dispatch, e.target)}>{locations}</ul>
              </Popover>
            }>
            <span className="species-num-locations">
              {species.locations.length}
            </span>
          </OverlayTrigger>
        </td>
        <td className="last-seen">{species.mostRecentObservationTime}</td>
        <td className="num-reported">{species.howManyCount}</td>
      </tr>
    );
  }
}

