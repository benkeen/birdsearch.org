import React from 'react';
import ReactDOM from 'react-dom';
import { Link, browserHistory } from 'react-router';
import { FormattedMessage, FormattedNumber, intlShape, injectIntl } from 'react-intl';
import { Overlay, OverlayTrigger, Popover } from 'react-bootstrap';
import { VelocityComponent } from 'velocity-react';
import { C, helpers, _, actions } from '../core/core';
import { LineLoader, LocationCount } from './general';


export class SightingsPanel extends React.Component {
  constructor (props) {
    super(props);
    this.getTitle = this.getTitle.bind(this);
    this.state = {
      nextAnimation: { opacity: this.props.visibility ? 1 : 0 }
    };
  }

  componentDidMount () {
    $(ReactDOM.findDOMNode(this.refs.panel)).css({ display: 'none' });
  }

  shouldComponentUpdate (nextProps) {
    return this.props.updateCounter !== nextProps.updateCounter;
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
    const { dispatch, locations, selectedLocation, searchSettings, sightings, intl } = this.props;

    var title = intl.formatMessage({ id: 'allLocations' });
    var counter = null;

    if (selectedLocation) {
      var locationInfo = helpers.getLocationById(locations, selectedLocation);

      if (sightings[selectedLocation].fetched) {
        var numSpecies = sightings[selectedLocation].data[searchSettings.observationRecency-1].runningTotal;
        counter = <LocationCount count={numSpecies} />;
      }

      title = (
        <span>
          <a href="#" onClick={(e) => { e.preventDefault(); dispatch(actions.selectLocation('')); }}>{title}</a>
          <span className="delimiter glyphicon glyphicon-triangle-right" />
          <span>{locationInfo.n}</span>
        </span>
      );
    }

    return (
      <div className="species-heading-row">
        <h1>{title}</h1>
        <div className="counter">{counter}</div>
        {(searchSettings.searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.ALL) ? this.getEBirdHotspotLink(selectedLocation) : null}
      </div>
    );
  }

  getTable () {
    const { dispatch, visible, searchSettings, selectedLocation, locations, sightings, showScientificName,
      speciesFilter, sort, sortDir, intl } = this.props;

    var selLocation = (selectedLocation) ? selectedLocation : null;

    if (searchSettings.searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.ALL) {
      let sightingsData = helpers.getSightings(locations, sightings, searchSettings.observationRecency, selLocation);

      return (
        <SpeciesTable
          dispatch={dispatch}
          tabVisible={visible}
          species={sightingsData}
          selectedLocation={selectedLocation}
          observationRecency={searchSettings.observationRecency}
          showScientificName={showScientificName}
          filter={speciesFilter}
          sort={sort}
          sortDir={sortDir}
          intl={intl} />
      );
    }

    let sightingsData = helpers.getNotableSightings(locations, sightings, searchSettings.observationRecency, selLocation);
    return (
      <NotableSightingsTable
        dispatch={dispatch}
        tabVisible={visible}
        species={sightingsData}
        selectedLocation={selectedLocation}
        observationRecency={searchSettings.observationRecency}
        showScientificName={showScientificName}
        filter={speciesFilter}
        sort={sort}
        sortDir={sortDir}
        intl={intl} />
    );
  }

  render () {
    const { dispatch, locations, sightings, searchSettings, env } = this.props;
    if (!locations.length) {
      return null;
    }

    var results = helpers.getUniqueSpeciesInLocationList(locations, sightings, searchSettings.observationRecency);
    const tabLangKey = searchSettings.searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.ALL ? 'birdSpecies' : 'notableBirds';

    return (
      <section id="species-panel" style={{ width: env.windowWidth - C.PANEL_DIMENSIONS.LEFT_PANEL_WIDTH }}>
        <header className="section-header" onClick={() => dispatch(actions.togglePanelVisibility(C.PANELS.SPECIES))}>
          <div>
            <h2>
              <FormattedMessage id={tabLangKey} />
              {(!results.allFetched) ? <LineLoader className="species-loading" /> : null}
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
                {this.getTable()}
              </div>
              <footer style={{ height: C.PANEL_DIMENSIONS.PANEL_FOOTER_HEIGHT + 'px' }} 
                onClick={() => dispatch(actions.togglePanelVisibility(C.PANELS.SPECIES))}>
                <span className="glyphicon glyphicon-triangle-top" />
              </footer>
            </div>
          </div>
        </VelocityComponent>
      </section>
    );
  }
}
SightingsPanel.PropTypes = {
  visible: React.PropTypes.bool.isRequired,
  updateCounter: React.PropTypes.number.isRequired,
  locations: React.PropTypes.array.isRequired,
  sightings: React.PropTypes.object.isRequired,
  searchSettings: React.PropTypes.object.isRequired,
  speciesFilter: React.PropTypes.string.isRequired,
  showScientificName: React.PropTypes.bool.isRequired,
  env: React.PropTypes.object.isRequired,
  intl: intlShape.isRequired
};


class SpeciesTable extends React.Component {

  componentDidMount () {
    this.sortedSpecies = this.props.species;
  }

  shouldComponentUpdate (nextProps) {
    // don't update anything if the user is closing the tab - it's super slow
    if (nextProps.tabVisible !== this.props.tabVisible && !nextProps.tabVisible) {
      return false;
    }
    return true;
  }

  componentWillReceiveProps ({ species, sort, sortDir }) {
    const numSpeciesChanged = species.length !== this.props.species.length;
    const sortChanged = sort !== this.props.sort;
    const sortDirChanged = sortDir !== this.props.sortDir;

    if (!numSpeciesChanged && !sortChanged && !sortDirChanged) {
      return;
    }

    this.sortedSpecies = helpers.sortSightings(species, sort, sortDir);
  }

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
    const { dispatch, filter, showScientificName } = this.props;

    return _.map(this.sortedSpecies, function (speciesInfo, index) {
      var comNameData = helpers.highlightString(speciesInfo.comName, filter);

      var sciNameData = {
        match: false,
        string: ''
      };
      if (showScientificName) {
        sciNameData = helpers.highlightString(speciesInfo.sciName, filter);
      }

      if (comNameData.match || (showScientificName && sciNameData.match)) {
        return (
          <SpeciesRow
            dispatch={dispatch}
            filter={filter}
            species={speciesInfo}
            rowNum={index+1}
            showScientificName={showScientificName}
            comName={speciesInfo.comName}
            comNameDisplay={comNameData.string}
            sciNameDisplay={sciNameData.string}
            key={index}/>
        );
      }

      return null;
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
    const { filter, dispatch, intl, sort, sortDir } = this.props;

    return (
      <div className="species-table">
        <div className="species-table-header" style={{ width: 'calc(100% - 30px)' }}>
          <table className="table table-striped">
            <thead>
              <tr>
                <th className="row-num" />
                <th className="species-col sortable">
                  <span onClick={() => dispatch(actions.sortSightings(C.SIGHTINGS_SORT.FIELDS.SPECIES))}>
                    <span className="species-header"><FormattedMessage id="species" /></span>
                    {helpers.getColSort(C.SIGHTINGS_SORT.FIELDS.SPECIES, sort, sortDir)}
                  </span>
                  <input type="text" placeholder={intl.formatMessage({ id: 'filterSpecies' })} className="filter-field" value={filter}
                    onChange={(e) => dispatch(actions.setSpeciesFilter(e.target.value))} />
                  {this.getClearSpeciesFilterIcon()}
                </th>
                <SortableColHeader dispatch={dispatch} label="locationsSeen" colClass="locations-seen"
                  sortField={C.SIGHTINGS_SORT.FIELDS.NUM_LOCATIONS} sort={sort} sortDir={sortDir} />

                <SortableColHeader dispatch={dispatch} label="lastSeen" colClass="last-seen"
                  sortField={C.SIGHTINGS_SORT.FIELDS.LAST_SEEN} sort={sort} sortDir={sortDir} />

                <SortableColHeader dispatch={dispatch} label="numReported" colClass="num-reported"
                  sortField={C.SIGHTINGS_SORT.FIELDS.NUM_REPORTED} sort={sort} sortDir={sortDir} />
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
          <a href={checklistLink} target="_blank" className="glyphicon glyphicon-list" title="View Checklist"></a>
        </li>
      );
    });
  }

  getSciName () {
    const { showScientificName, sciNameDisplay } = this.props;
    if (!showScientificName) {
      return null;
    }
    return (
      <div className="sci-name" dangerouslySetInnerHTML={{ __html: sciNameDisplay }}></div>
    );
  }

  render () {
    const { dispatch, species, comName, comNameDisplay, rowNum } = this.props;
    const wikipediaLink = 'https://en.wikipedia.org/wiki/Special:Search/' + comName;

    var locations = this.getLocations();

    return (
      <tr>
        <td className="row-num">{rowNum}</td>
        <td className="species-col">
          <div className="com-name" dangerouslySetInnerHTML={{ __html: comNameDisplay }}></div>
          {this.getSciName()}
        </td>
        <td ref="cell" className="locations-seen species-num-locations-cell">
          <OverlayTrigger trigger="click" placement="bottom" rootClose={true} container={this.refs.cell}
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
        <td className="last-seen">
          <div>{species.mostRecentObservationTime}</div>
        </td>
        <td className="num-reported">
          <FormattedNumber value={species.howManyCount} />
        </td>
        <td>
          <a href={wikipediaLink} target="_blank" className="icon icon-wikipedia" />
        </td>
      </tr>
    );
  }
}


class NotableSightingsTable extends React.Component {
  constructor (props) {
    super(props);
  }

  componentDidMount () {
    this.sortedSpecies = this.props.species;
  }

  shouldComponentUpdate (nextProps) {
    // don't update anything if the user is closing the tab - it's super slow
    if (nextProps.tabVisible !== this.props.tabVisible && !nextProps.tabVisible) {
      return false;
    }
    return true;
  }

  componentWillReceiveProps ({ species, sort, sortDir }) {
    const numSpeciesChanged = species.length !== this.props.species.length;
    const sortChanged = sort !== this.props.sort;
    const sortDirChanged = sortDir !== this.props.sortDir;

    if (!numSpeciesChanged && !sortChanged && !sortDirChanged) {
      return;
    }
    this.sortedSpecies = helpers.sortSightings(species, sort, sortDir);
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
    const { dispatch, selectedLocation, filter } = this.props;

    return _.map(this.sortedSpecies, function (row, index) {
      var comNameData = helpers.highlightString(row.comName, filter);
      var sciNameData = helpers.highlightString(row.sciName, filter);
      if (!comNameData.match && !sciNameData.match) {
        return null;
      }

      return (
        <NotableSpeciesRow
          dispatch={dispatch}
          selectedLocation={selectedLocation}
          filter={filter}
          row={row}
          rowNum={index+1}
          comName={row.comName}
          comNameDisplay={comNameData.string}
          sciNameDisplay={sciNameData.string}
          key={index} />
      );
    });
  }

  getLocationColHeader () {
    const { selectedLocation, dispatch, sort, sortDir } = this.props;
    if (selectedLocation) {
      return null;
    }

    return (
      <SortableColHeader dispatch={dispatch} ref="location" label="location" colClass="location-col"
        sortField={C.NOTABLE_SIGHTINGS_SORT.FIELDS.LOCATION} sort={sort} sortDir={sortDir} />
    );
  }

  render () {
    const { dispatch, sort, sortDir } = this.props;

    return (
      <div className="species-table notable-table">
        <div className="species-table-header">
          <table className="table table-striped">
            <thead>
            <tr>
              <th className="row-num" />
              {this.getLocationColHeader()}

              <SortableColHeader dispatch={dispatch} label="species" colClass="species-col"
                sortField={C.NOTABLE_SIGHTINGS_SORT.FIELDS.SPECIES} sort={sort} sortDir={sortDir} />

              <SortableColHeader dispatch={dispatch} label="dateSeen" colClass="date-seen-col"
                sortField={C.NOTABLE_SIGHTINGS_SORT.FIELDS.DATE_SEEN} sort={sort} sortDir={sortDir} />

              <SortableColHeader dispatch={dispatch} label="reportedBy" colClass="reporter-col"
                sortField={C.NOTABLE_SIGHTINGS_SORT.FIELDS.REPORTER} sort={sort} sortDir={sortDir} />

              <SortableColHeader dispatch={dispatch} label="status" colClass="status-col"
                sortField={C.NOTABLE_SIGHTINGS_SORT.FIELDS.STATUS} sort={sort} sortDir={sortDir} />
            </tr>
            </thead>
          </table>
        </div>
        <div className="species-table-content-wrapper">
          <table className="species-table-content table table-striped" id="notable-sightings-table">
            {this.getContent()}
          </table>
        </div>
      </div>
    );
  }
}

class SortableColHeader extends React.Component {
  render () {
    const { dispatch, label, sortField, colClass, sort, sortDir, width } = this.props;
    const className = 'sortable ' + colClass;

    const style = (width) ? { width: width + 'px' } : {};
    return (
      <th className={className} onClick={() => dispatch(actions.sortSightings(sortField))} style={style}>
        <FormattedMessage id={label} />
        {helpers.getColSort(sortField, sort, sortDir)}
      </th>
    )
  }
}
SortableColHeader.propTypes = {
  label: React.PropTypes.string.isRequired,
  sortField: React.PropTypes.string.isRequired,
  colClass: React.PropTypes.string.isRequired
};


class NotableSpeciesRow extends React.Component {
  getLocationField () {
    const { selectedLocation, row } = this.props;
    if (selectedLocation) {
      return null;
    }
    return (
      <td className="location-col">{row.locName}</td>
    );
  }

  getStatus (row) {
    let status = null;
    if (row.obsValid) {
      status = <span className="confirmed"><FormattedMessage id="confirmed" /></span>;
    } else if (row.obsReviewed) {
      status = <span className="reviewed"><FormattedMessage id="reviewed" /></span>;
    } else {
      status = <span className="not-reviewed"><FormattedMessage id="notReviewed" /></span>;
    }
    return status;
  }

  render () {
    const { row, comName, comNameDisplay, sciNameDisplay, rowNum } = this.props;
    const wikipediaLink = 'https://en.wikipedia.org/wiki/Special:Search/' + comName;
    const checklistLink = `http://ebird.org/ebird/view/checklist/${row.subID}`;

    return (
      <tr>
        <td className="row-num">{rowNum}</td>
        {this.getLocationField()}
        <td className="species-col">
          <div>
            <span className="com-name" dangerouslySetInnerHTML={{ __html: comNameDisplay }} />
            <span className="notable-count">(<FormattedNumber value={row.howMany} />)</span>
          </div>
          <div className="sci-name" dangerouslySetInnerHTML={{ __html: sciNameDisplay }}></div>
        </td>
        <td className="date-seen-col">{row.obsDtDisplay}</td>
        <td className="reporter-col">{row.reporter}</td>
        <td className="status-col">{this.getStatus(row)}</td>
        <td className="checklist-col">
          <a href={checklistLink} target="_blank" className="checklist glyphicon glyphicon-list" title="View Checklist" />
        </td>
        <td className="wikipedia-col">
          <a href={wikipediaLink} target="_blank" className="icon icon-wikipedia" />
        </td>
      </tr>
    );
  }
}
