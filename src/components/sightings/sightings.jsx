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
    this.toggleVisibility = this.toggleVisibility.bind(this);
    this.state = {
      nextAnimation: { opacity: this.props.visibility ? 1 : 0 }
    };
  }

  componentDidMount () {
    $(ReactDOM.findDOMNode(this.refs.panel)).css({ display: 'none' });
  }

  shouldComponentUpdate (nextProps) {
    const locationsJustAdded = this.props.locations.length === 0 && nextProps.locations.length > 0;
    if (locationsJustAdded) {
      return true;
    }

    return this.props.updateCounter !== nextProps.updateCounter;
  }

  componentWillReceiveProps (nextProps) {
    const { visible, env } = this.props;

    var animation = {};
    var hasAnimation = false;

    // the header on mobile is slightly taller than on desktop
    const isMobile = env.viewportMode === C.VIEWPORT_MODES.MOBILE;
    const heightOffset = 85 + ((isMobile) ? 48 : 0);

    if (visible !== nextProps.visible) {
      hasAnimation = true;
      animation = { opacity: nextProps.visible ? 1 : 0 };

      if (nextProps.visible) {
        animation = { opacity: 1, height: (env.windowHeight - heightOffset) + 'px' };
      } else {
        animation = { opacity: 0.5, height: 0 };
      }
    }

    // this resizes the visible location panel whenever the browser height changes
    if (nextProps.env.windowHeight !== env.windowHeight && visible) {
      hasAnimation = true;
      animation = { height: (nextProps.env.windowHeight - heightOffset) + 'px' };
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
    const { dispatch, locations, sightings, selectedLocation, searchSettings, intl } = this.props;
    const { searchType, observationRecency } = searchSettings;
    const totalSectionClassOverride = (searchSettings.searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.ALL) ? null : 'notableSightingsTotal';

    var title = intl.formatMessage({ id: 'allLocations' });
    let numSpecies = 0;

    if (selectedLocation) {
      var locationInfo = helpers.getLocationById(locations, selectedLocation);

      if (sightings[selectedLocation].fetched) {
        numSpecies = sightings[selectedLocation].data[searchSettings.observationRecency-1].runningTotal;
      }

      title = (
        <span>
          <a href="#" onClick={(e) => { e.preventDefault(); dispatch(actions.selectLocation('')); }}>{title}</a>
          <span className="delimiter glyphicon glyphicon-triangle-right" />
          <span>{locationInfo.n}</span>
        </span>
      );
    } else {
      numSpecies = helpers.getAllLocationsCount(searchType, observationRecency, locations, sightings);
    }

    return (
      <div className="species-heading-row">
        <h1>{title}</h1>
        <div className="counter"><LocationCount count={numSpecies} classNameOverride={totalSectionClassOverride} /></div>
        {(searchSettings.searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.ALL) ? this.getEBirdHotspotLink(selectedLocation) : null}
      </div>
    );
  }

  getTable () {
    const { dispatch, visible, searchSettings, selectedLocation, locations, sightings, showScientificName,
      speciesFilter, sort, sortDir, env, intl } = this.props;

    var selLocation = (selectedLocation) ? selectedLocation : null;

    if (searchSettings.searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.ALL) {
      let sightingsData = helpers.getSightings(locations, sightings, searchSettings.observationRecency, selLocation);

      return (
        <SpeciesTable
          intl={intl}
          dispatch={dispatch}
          tabVisible={visible}
          species={sightingsData}
          selectedLocation={selectedLocation}
          observationRecency={searchSettings.observationRecency}
          showScientificName={showScientificName}
          filter={speciesFilter}
          sort={sort}
          sortDir={sortDir}
          viewportMode={env.viewportMode} />
      );
    }

    let sightingsData = helpers.getNotableSightings(locations, sightings, searchSettings.observationRecency, selLocation);
    return (
      <NotableSightingsTable
        intl={intl}
        dispatch={dispatch}
        tabVisible={visible}
        species={sightingsData}
        selectedLocation={selectedLocation}
        observationRecency={searchSettings.observationRecency}
        showScientificName={showScientificName}
        filter={speciesFilter}
        sort={sort}
        sortDir={sortDir}
        env={env} />
    );
  }

  toggleVisibility () {
    const { dispatch, env } = this.props;
    dispatch(actions.togglePanelVisibility(C.PANELS.SPECIES));
    if (env.viewportMode === C.VIEWPORT_MODES.MOBILE) {
      dispatch(actions.hideLocationsPanel());
    }
  }

  render () {
    const { dispatch, locations, sightings, searchSettings, visible, env } = this.props;
    if (!locations.length) {
      return null;
    }

    var results = helpers.getUniqueSpeciesInLocationList(locations, sightings, searchSettings.observationRecency);
    const tabLangKey = searchSettings.searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.ALL ? 'birds' : 'notableBirds';
    const headerIconClasses = 'toggle-section glyphicon ' + (visible ? 'glyphicon-triangle-top' : 'glyphicon-triangle-bottom');
    const headerClasses = 'section-header' + ((visible) ? ' visible' : '');
    const transitionSpeed = (env.viewportMode === C.VIEWPORT_MODES.MOBILE) ? 0 : C.TRANSITION_SPEED;

    return (
      <section id="species-panel" style={{ width: env.windowWidth - C.PANEL_DIMENSIONS.LEFT_PANEL_WIDTH }}>
        <header className={headerClasses} onClick={() => this.toggleVisibility()}>
          <div>
            <h2>
              <FormattedMessage id={tabLangKey} />
              {(!results.allFetched) ? <LineLoader className="species-loading" /> : null}
            </h2>
            <span className={headerIconClasses} />
          </div>
        </header>

        <VelocityComponent animation={this.state.nextAnimation} duration={transitionSpeed}
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

/*
<SightingsPanel
  dispatch={dispatch}
  visible={sightingsPanel.visible}
  updateCounter={sightingsPanel.updateCounter}
  locations={results.visibleLocations}
  sightings={results.locationSightings}
  selectedLocation={locationsPanel.selectedLocation}
  searchSettings={searchSettings}
  speciesFilter={sightingsPanel.filter}
  showScientificName={showScientificName}
  env={env}
  intl={intl}
  results={results}
  sort={sightingsPanel.sort}
  sortDir={sightingsPanel.sortDir} />
*/

class SpeciesTable extends React.Component {

  componentDidMount () {
    this.sortedSpecies = this.props.species;
  }

  // we don't update anything if the user is closing the tab - it's super slow
  shouldComponentUpdate (nextProps) {
    return !(nextProps.tabVisible !== this.props.tabVisible && !nextProps.tabVisible);
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
    const { dispatch, filter, showScientificName, viewportMode, intl } = this.props;

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
            intl={intl}
            filter={filter}
            species={speciesInfo}
            rowNum={index+1}
            showScientificName={showScientificName}
            comName={speciesInfo.comName}
            comNameDisplay={comNameData.string}
            sciNameDisplay={sciNameData.string}
            viewportMode={viewportMode}
            key={index} />
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

  getLastSeenHeader () {
    const { viewportMode, dispatch, sort, sortDir } = this.props;
    if (viewportMode === C.VIEWPORT_MODES.MOBILE) {
      return null;
    }
    return (
      <SortableColHeader dispatch={dispatch} label="lastSeen" colClass="last-seen"
         sortField={C.SIGHTINGS_SORT.FIELDS.LAST_SEEN} sort={sort} sortDir={sortDir} />
    );
  }

  render () {
    const { filter, dispatch, intl, sort, sortDir } = this.props;

    return (
      <div className="species-table">
        <div className="species-table-header" style={{ width: 'calc(100% - 25px)' }}>
          <table className="table table-striped">
            <thead>
              <tr>
                <th className="row-num" />
                <th className="species-col sortable">
                  <span onClick={() => dispatch(actions.sortSightings(C.SIGHTINGS_SORT.FIELDS.SPECIES))}>
                    <span className="species-header"><FormattedMessage id="species" /></span>
                    {helpers.getColSort(C.SIGHTINGS_SORT.FIELDS.SPECIES, sort, sortDir)}
                  </span>
                  <input type="text" placeholder={intl.formatMessage({ id: 'filterSpecies' })}
                    className="filter-field search-input-field" value={filter}
                    onChange={(e) => dispatch(actions.setSpeciesFilter(e.target.value))} />
                  {this.getClearSpeciesFilterIcon()}
                </th>
                <SortableColHeader dispatch={dispatch} label="locations" colClass="locations-seen"
                  sortField={C.SIGHTINGS_SORT.FIELDS.NUM_LOCATIONS} sort={sort} sortDir={sortDir} />

                {this.getLastSeenHeader()}

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
    const { intl, species } = this.props;
    const viewChecklistLabel = intl.formatMessage({ id: 'viewChecklist' });

    return _.map(species.locations, function (locInfo) {
      const checklistLink = `http://ebird.org/ebird/view/checklist/${locInfo.subID}`;
      return (
        <li key={locInfo.locID}>
          <span data-id={locInfo.locID}>{locInfo.locName}</span>
          <a href={checklistLink} target="_blank" className="glyphicon glyphicon-list" title={viewChecklistLabel} />
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

  getNumReported (species) {
    if (species.howManyCount && species.howManyCount !== '0') {
      return (<FormattedNumber value={species.howManyCount} />);
    }
    return <span className="unknown-count">-</span>;
  }

  getRecentObservationTime (time) {
    const { viewportMode } = this.props;
    if (viewportMode === C.VIEWPORT_MODES.MOBILE) {
      return null;
    }

    return (
      <td className="last-seen">
        <div>{time}</div>
      </td>
    );
  }

  render () {
    const { dispatch, species, comName, comNameDisplay, rowNum, intl } = this.props;
    const wikipediaLink = 'https://en.wikipedia.org/wiki/Special:Search/' + comName;

    var locations = this.getLocations();
    const title = intl.formatMessage({ id: 'locations'});

    return (
      <tr>
        <td className="row-num">{rowNum}</td>
        <td className="species-col">
          <div>
            <a href={wikipediaLink} target="_blank" className="com-name">
              <span dangerouslySetInnerHTML={{ __html: comNameDisplay }} />
              <span className="icon icon-wikipedia" />
            </a>
          </div>
          {this.getSciName()}
        </td>
        <td ref="cell" className="locations-seen species-num-locations-cell">
          <OverlayTrigger trigger="click" placement="left" rootClose={true} container={this.refs.cell}
            overlay={
              <Popover title={title} id="locations-popover">
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
        {this.getRecentObservationTime(species.mostRecentObservationTime)}
        <td className="num-reported">{this.getNumReported(species)}</td>
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
    const { dispatch, selectedLocation, showScientificName, filter, env, intl } = this.props;
    const isMobile = (env.viewportMode === C.VIEWPORT_MODES.MOBILE);

    return _.map(this.sortedSpecies, function (row, index) {
      var comNameData = helpers.highlightString(row.comName, filter);
      var sciNameData = helpers.highlightString(row.sciName, filter);
      if (!comNameData.match && !sciNameData.match) {
        return null;
      }

      if (isMobile) {
        return (
          <NotableSpeciesMobileRow
            dispatch={dispatch}
            selectedLocation={selectedLocation}
            filter={filter}
            row={row}
            showScientificName={showScientificName}
            rowNum={index+1}
            comName={row.comName}
            comNameDisplay={comNameData.string}
            sciNameDisplay={sciNameData.string}
            key={index}
            intl={intl} />
        );
      }

      return (
        <NotableSpeciesRow
          dispatch={dispatch}
          selectedLocation={selectedLocation}
          filter={filter}
          row={row}
          showScientificName={showScientificName}
          rowNum={index+1}
          comName={row.comName}
          comNameDisplay={comNameData.string}
          sciNameDisplay={sciNameData.string}
          key={index}
          intl={intl} />
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

  getNotableSightingsHeader () {
    const { env, dispatch, sort, sortDir } = this.props;

    if (env.viewportMode === C.VIEWPORT_MODES.MOBILE) {
      return null;
    }

    return (
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
    );
  }

  render () {
    return (
      <div className="species-table notable-table">
        <div className="species-table-header">
          <table className="table table-striped">
            <thead>
            {this.getNotableSightingsHeader()}
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

const SortableColHeader = ({ dispatch, label, sortField, colClass, sort, sortDir, width }) = (
  <th className={'sortable ' + colClass} onClick={() => dispatch(actions.sortSightings(sortField))}
    style={(width) ? { width: width + 'px' } : {}}>
    <FormattedMessage id={label} />
    {helpers.getColSort(sortField, sort, sortDir)}
  </th>
);
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

  getCount (row) {
    if (row.howMany) {
      return <span>(<FormattedNumber value={row.howMany}/>)</span>;
    }
    return null;
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
    const { row, comName, comNameDisplay, rowNum, intl } = this.props;
    const wikipediaLink = 'https://en.wikipedia.org/wiki/Special:Search/' + comName;
    const checklistLink = `http://ebird.org/ebird/view/checklist/${row.subID}`;

    return (
      <tr>
        <td className="row-num">{rowNum}</td>
        {this.getLocationField()}
        <td className="species-col">
          <div>
            <a href={wikipediaLink} target="_blank" className="com-name">
              <span dangerouslySetInnerHTML={{ __html: comNameDisplay }} />
              <span className="icon icon-wikipedia" />
            </a>
            <span className="notable-count">{this.getCount(row)}</span>
          </div>
          {this.getSciName()}
        </td>
        <td className="date-seen-col">{row.obsDtDisplay}</td>
        <td className="reporter-col">{row.reporter}</td>
        <td className="status-col">{this.getStatus(row)}</td>
        <td className="checklist-col">
          <a href={checklistLink} target="_blank" className="checklist glyphicon glyphicon-list"
             title={intl.formatMessage({ id: 'viewChecklist' })} />
        </td>
      </tr>
    );
  }
}

class NotableSpeciesMobileRow extends React.Component {
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

  getCount (row) {
    if (row.howMany) {
      return <span>(<FormattedNumber value={row.howMany}/>)</span>;
    }
    return null;
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
    const { row, comName, comNameDisplay, rowNum, intl } = this.props;
    const wikipediaLink = 'https://en.wikipedia.org/wiki/Special:Search/' + comName;
    const checklistLink = `http://ebird.org/ebird/view/checklist/${row.subID}`;

    return (
      <tr>
        <td className="row-num">{rowNum}</td>
        <td className="species-col">
          <div>
            <a href={wikipediaLink} target="_blank" className="com-name">
              <span dangerouslySetInnerHTML={{ __html: comNameDisplay }} />
              <span className="icon icon-wikipedia" />
            </a>
            <span className="notable-count">{this.getCount(row)}</span>
          </div>
          {this.getSciName()}
          {this.getLocationField()}
          <div>{row.obsDtDisplay}</div>
          <div>{row.reporter}</div>
          <div>{this.getStatus(row)}</div>
        </td>
        <td className="checklist-col">
          <a href={checklistLink} target="_blank" className="checklist glyphicon glyphicon-list"
             title={intl.formatMessage({ id: 'viewChecklist' })} />
        </td>
      </tr>
    );
  }
}
