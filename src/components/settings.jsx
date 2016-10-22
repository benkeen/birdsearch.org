import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { browserHistory } from 'react-router';
import { Overlay } from './general';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { C, _, actions } from '../core/core';


class SettingsOverlay extends React.Component {
  constructor (props) {
    super(props);
  }

  close () {
    browserHistory.push('/');
  }

  getContent () {
    const { selectedTab, searchType, zoomHandling, observationRecency, showScientificName } = this.props.settings;
    const { dispatch, intl, location } = this.props;

    if (selectedTab === C.SEARCH_OVERLAY_TABS.SEARCH_SETTINGS) {
      return (
        <SearchSettings
          dispatch={dispatch}
          intl={intl}
          zoomHandling={zoomHandling}
          observationRecency={observationRecency}
          location={location}
          searchType={searchType} />
      );
    } else {
      return (
        <MiscSettings
          dispatch={dispatch}
          intl={intl}
          showScientificName={showScientificName} />
      );
    }
  }

  selectTab (e, tab) {
    e.preventDefault();
    const { dispatch } = this.props;
    const { selectedTab } = this.props.settings;
    if (tab === selectedTab) {
      return;
    }
    dispatch(actions.selectSettingsOverlayTab(tab));
  }

  render () {
    const { selectedTab } = this.props.settings;
    const searchSettingsClasses = (selectedTab === C.SEARCH_OVERLAY_TABS.SEARCH_SETTINGS) ? 'active' : '';
    const miscClasses = (selectedTab === C.SEARCH_OVERLAY_TABS.MISC_TAB) ? 'active' : '';

    return (
      <Overlay id="settings-overlay" onClose={this.close} showCloseIcon={true}>
        <div className="">
          <ul className="nav nav-pills">
            <li className={searchSettingsClasses}>
              <a href="#" onClick={(e) => this.selectTab(e, C.SEARCH_OVERLAY_TABS.SEARCH_SETTINGS)}><FormattedMessage id="searchSettings" /></a>
            </li>
            <li className={miscClasses}>
              <a href="#" onClick={(e) => this.selectTab(e, C.SEARCH_OVERLAY_TABS.MISC_TAB)}><FormattedMessage id="miscSettings" /></a>
            </li>
          </ul>
        </div>
        {this.getContent()}
      </Overlay>
    );
  }
}

export default injectIntl(connect(state => ({
  userLocationFound: state.user.userLocationFound,
  settings: state.settingsOverlay,
  location: state.searchSettings.location,
  mapSettings: state.mapSettings
}))(SettingsOverlay));



class SearchSettings extends React.Component {
  constructor (props) {
    super(props);
    this.search = this.search.bind(this);
  }

  search () {
    browserHistory.push('/');
  }

  getSearchRow () {
    const { location } = this.props;
    if (!location) {
      return false;
    }

    return (
      <footer>
        <button className="btn btn-primary" onClick={this.search}>
          <FormattedMessage id="search" />
        </button>
      </footer>
    );
  }

  render() {
    const { dispatch, searchType, zoomHandling, observationRecency, intl } = this.props;

    const autoZoomTooltip = (
      <Tooltip id="search-results-tooltip">
        <div>
          <FormattedMessage id="autoZoomSetting1"/>
          <ul>
            <li><FormattedMessage id="autoZoomSetting2" values={{ autoZoom: <b>{intl.formatMessage({ id: 'autoZoom' })}</b> }}/></li>
            <li><FormattedMessage id="autoZoomSetting3" values={{ showFullSearch: <b>{intl.formatMessage({ id: 'showFullSearchRange' })}</b> }}/></li>
          </ul>
        </div>
      </Tooltip>
    );

    const searchTypeTooltip = (
      <Tooltip id="search-type-tooltip">
        <div>
          <FormattedMessage id="resultType1"/>
          <ul>
            <li><FormattedMessage id="resultType2" values={{ birdSightings: <b>{intl.formatMessage({ id: 'birdSightings' })}</b> }}/></li>
            <li><FormattedMessage id="resultType3" values={{ notableSightings: <b>{intl.formatMessage({ id: 'notableSightings' })}</b> }}/></li>
          </ul>
        </div>
      </Tooltip>
    );

    return (
      <div>
        <div className="settings-row">
          <span className="settings-row-label"><FormattedMessage id="resultType"/></span>
          <span className="search-type">
            <span>
              <input type="radio" name="search-type" id="rt1"
                checked={searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.ALL}
                onChange={() => { dispatch(actions.setSearchType(C.SEARCH_SETTINGS.SEARCH_TYPES.ALL)); }}/>
              <label htmlFor="rt1"><FormattedMessage id="birdSightings"/></label>
            </span>
            <span>
              <OverlayTrigger placement="left" overlay={searchTypeTooltip}>
                <span className="zoom-tip glyphicon glyphicon-info-sign"/>
              </OverlayTrigger>
              <input type="radio" name="search-type" id="rt2" className="margin-left"
                checked={searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.NOTABLE}
                onChange={() => { dispatch(actions.setSearchType(C.SEARCH_SETTINGS.SEARCH_TYPES.NOTABLE)); }}/>
              <label htmlFor="rt2"><FormattedMessage id="notableSightings"/></label>
            </span>
          </span>
        </div>

        <div className="settings-row">
          <span className="settings-row-label"><FormattedMessage id="searchResults"/></span>
          <span className="search-results">
            <span>
              <input type="radio" name="zoom-handling" id="zh1"
                checked={zoomHandling === C.SEARCH_SETTINGS.ZOOM_HANDLING.AUTO_ZOOM}
                onChange={() => { dispatch(actions.setZoomHandling(C.SEARCH_SETTINGS.ZOOM_HANDLING.AUTO_ZOOM)); }}/>
              <label htmlFor="zh1"><FormattedMessage id="autoZoom"/></label>
            </span>
            <span>
              <OverlayTrigger placement="left" overlay={autoZoomTooltip}>
                <span className="zoom-tip glyphicon glyphicon-info-sign"/>
              </OverlayTrigger>
              <input type="radio" name="zoom-handling" className="margin-left" id="zh2"
                checked={zoomHandling === C.SEARCH_SETTINGS.ZOOM_HANDLING.FULL_SEARCH}
                onChange={() => { dispatch(actions.setZoomHandling(C.SEARCH_SETTINGS.ZOOM_HANDLING.FULL_SEARCH)); }}/>
              <label htmlFor="zh2"><FormattedMessage id="showFullSearchRange"/></label>
            </span>
          </span>
        </div>

        <div className="observation-recency-setting">
          <span>
            Show observations made in the last
            <DaysDropdown value={observationRecency}
              onChange={(val) => { dispatch(actions.setObservationRecency(val)); }}/>days.
          </span>
        </div>

        {this.getSearchRow()}
      </div>
    );
  }
}
SearchSettings.propTypes = {
  searchType: React.PropTypes.string.isRequired,
  zoomHandling: React.PropTypes.string.isRequired,
  observationRecency: React.PropTypes.string.isRequired,
  location: React.PropTypes.string.isRequired
};


class MiscSettings extends React.Component {
  constructor (props) {
    super(props);
    this.toggleScientificName = this.toggleScientificName.bind(this);
  }

  toggleScientificName () {
    const { dispatch, showScientificName } = this.props;
    dispatch(actions.setScientificNameVisibility(!showScientificName));
  }

  render () {
    const { showScientificName } = this.props;

    return (
      <div>
        <div className="settings-row">
          <span className="settings-row-label"><FormattedMessage id="speciesName" /></span>
          <span className="search-type">
            <span>
              <input type="checkbox" id="scientific-name" checked={showScientificName} onChange={this.toggleScientificName} />
                <label htmlFor="scientific-name">include scientific name</label>
            </span>
          </span>
        </div>
      </div>
    );
  }
}


class DaysDropdown extends React.Component {
  getDays () {
    const days = [1,2,3,4,5,7,10,14,20,30];
    return _.map(days, (day) => {
      return (<option value={day} key={day}>{day}</option>);
    });
  }

  render () {
    const { value, onChange } = this.props;
    return (
      <select className="num-days" value={value} onChange={(e) => { onChange(e.target.value); }}>
        {this.getDays()}
      </select>
    );
  }
}
DaysDropdown.propTypes = {
  onChange: React.PropTypes.func.isRequired
};


