import React from 'react';
import ReactDOM from 'react-dom';
import { FormattedMessage } from 'react-intl';
import { VelocityComponent } from 'velocity-react';
import { C, E, helpers, _, actions } from '../core/core';
import { Loader, ClosePanel, LocationsDropdown, LineLoader, LocationSpeciesCount } from './general';
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

  getEBirdHotspotLink (selectedLocation) {
    if (!selectedLocation) {
      return;
    }
    const link = `http://ebird.org/ebird/hotspot/${selectedLocation}`;
    return (
      <span className="eBirdLink">
        <a href={link} target="_blank">
          <span className="eBird">e</span>Bird hotspot
          <span className="eBirdOffsiteIcon glyphicon glyphicon-new-window" />
        </a>
      </span>
    );
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
          <span className="delimiter glyphicon glyphicon-triangle-right" />
          <span>{locationInfo.n}</span>
        </span>
      );
    }

    return (
      <div className="species-heading-row">
        <h1>{title}</h1>
        <div className="counter">{counter}</div>
        {this.getEBirdHotspotLink(selectedLocation)}
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

    var loader = null;
    if (!results.allFetched) {
      loader = <LineLoader className="species-loading" />;
    }

    var footerStyle = {
      height: C.PANEL_DIMENSIONS.PANEL_FOOTER_HEIGHT + 'px'
    };

    var selLocation = (selectedLocation) ? selectedLocation : null;
    var sightingsData = helpers.getSightings(locations, sightings, searchSettings.observationRecency, selLocation);

    return (
      <section id="species-panel" style={panelPosition}>

        <header className="section-header" onClick={() => dispatch(actions.togglePanelVisibility(C.PANELS.SPECIES))}>
          <div>
            <h2>
              <FormattedMessage id="birdSpecies" />
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

  componentDidMount () {
    this.sortedSpecies = this.props.species;
  }

  shouldComponentUpdate (nextProps) {
    const { sort, sortDir } = this.props;

    // TODO also need to do this for "ALL" when new data is still coming in

    var resort = false;
    if (nextProps.sort !== sort) {
      resort = true;
    } else if (nextProps.sortDir !== sortDir) {
      resort = true;
    }

    this.sortedSpecies = nextProps.species;
    if (resort) {

      console.log('resort');

      // speed this sucker up
      switch (sort) {
        case C.SPECIES_SORT.FIELDS.SPECIES:
          if (sortDir === C.SORT_DIR.DEFAULT) {
            this.sortedSpecies = _.sortBy(this.sortedSpecies, function (i) { return i.comName.toLowerCase().charCodeAt() * -1; });
          } else {
            this.sortedSpecies = _.sortBy(this.sortedSpecies, function (i) { return i.comName.toLowerCase(); });
          }
          break;

        case C.SPECIES_SORT.FIELDS.NUM_LOCATIONS:
          if (sortDir === C.SORT_DIR.DEFAULT) {
            this.sortedSpecies = _.sortBy(this.sortedSpecies, function (i) { return i.locations.length; });
          } else {
            this.sortedSpecies = _.sortBy(this.sortedSpecies, function (i) { return -i.locations.length; });
          }
          break;

        case C.SPECIES_SORT.FIELDS.LAST_SEEN:
          if (sortDir === C.SORT_DIR.DEFAULT) {
            this.sortedSpecies = _.sortBy(this.sortedSpecies, function (i) { return i.mostRecentObservation.format('X'); });
          } else {
            this.sortedSpecies = _.sortBy(this.sortedSpecies, function (i) { return -i.mostRecentObservation.format('X'); });
          }
          break;

        case C.SPECIES_SORT.FIELDS.NUM_REPORTED:
          if (sortDir === C.SORT_DIR.DEFAULT) {
            this.sortedSpecies = _.sortBy(this.sortedSpecies, function (i) { return i.howManyCount; });
          } else {
            this.sortedSpecies = _.sortBy(this.sortedSpecies, function (i) { return -i.howManyCount; });
          }
          break;
      }

    }

    return true;
  }

  getRows () {
    const { dispatch, filter } = this.props;

    return _.map(this.sortedSpecies, function (speciesInfo, index) {
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
          comName={speciesInfo.comName}
          comNameDisplay={comNameData.string}
          sciNameDisplay={sciNameData.string}
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
        <div className="species-table-header" style={{ width: 'calc(100% - 30px)' }}>
          <table className="table table-striped">
            <thead>
              <tr>
                <th className="row-num"></th>
                <th className="species-col sortable">
                  <span onClick={() => dispatch(actions.sortSpecies(C.SPECIES_SORT.FIELDS.SPECIES))}>
                    <span className="species-header">Species</span>
                    {this.getSpeciesColSort(C.SPECIES_SORT.FIELDS.SPECIES)}
                  </span>
                  <input type="text" placeholder="Filter Species" className="filter-field" value={filter}
                    onChange={(e) => dispatch(actions.setSpeciesFilter(e.target.value))} />
                  {this.getClearSpeciesFilterIcon()}
                </th>
                <th className="locations-seen sortable" onClick={() => dispatch(actions.sortSpecies(C.SPECIES_SORT.FIELDS.NUM_LOCATIONS))}>
                  Locations Seen
                  {this.getSpeciesColSort(C.SPECIES_SORT.FIELDS.NUM_LOCATIONS)}
                </th>
                <th className="last-seen sortable" onClick={() => dispatch(actions.sortSpecies(C.SPECIES_SORT.FIELDS.LAST_SEEN))}>
                  Last Seen
                  {this.getSpeciesColSort(C.SPECIES_SORT.FIELDS.LAST_SEEN)}
                </th>
                <th className="num-reported sortable" onClick={() => dispatch(actions.sortSpecies(C.SPECIES_SORT.FIELDS.NUM_REPORTED))}>
                  Num Reported
                  {this.getSpeciesColSort(C.SPECIES_SORT.FIELDS.NUM_REPORTED)}
                </th>
              </tr>
            </thead>
          </table>
        </div>
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
      const checklistLink = `http://ebird.org/ebird/view/checklist/${locInfo.subID}`;
      return (
        <li key={locInfo.locID}>
          <span data-id={locInfo.locID}>{locInfo.locName}</span>
          <a href={checklistLink} target="_blank" className="glyphicon glyphicon-list"></a>
        </li>
      );
    });
  }

  render () {
    const { dispatch, species, comName, comNameDisplay, sciNameDisplay, rowNum } = this.props;
    var locations = this.getLocations();

    const wikipediaLink = 'https://en.wikipedia.org/wiki/Special:Search/' + comName;

    return (
      <tr>
        <td className="row-num">{rowNum}</td>
        <td className="species-col">
          <div className="com-name" dangerouslySetInnerHTML={{ __html: comNameDisplay }}></div>
          <div className="sci-name" dangerouslySetInnerHTML={{ __html: sciNameDisplay }}></div>
        </td>
        <td ref="cell" className="locations-seen species-num-locations-cell">
          <OverlayTrigger trigger="click" placement="bottom" rootClose={true} show={this.state.show} container={this.refs.cell}
            overlay={
              <Popover title="Locations" id="locations-popover">
                <ul className="bird-location-sightings" onClick={(e) => this.selectLocation(dispatch, e.target)}>
                  {locations}
                </ul>
              </Popover>
            }>
            <span className="species-num-locations">
              {species.locations.length}
            </span>
          </OverlayTrigger>
        </td>
        <td className="last-seen">{species.mostRecentObservationTime}</td>
        <td className="num-reported">{species.howManyCount}</td>
        <td>
          <a href={wikipediaLink} target="_blank" className="icon icon-wikipedia" />
        </td>
      </tr>
    );
  }
}

