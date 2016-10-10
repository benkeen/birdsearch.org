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
    this.maybeSearch = this.maybeSearch.bind(this);
  }

  close () {
    browserHistory.push('/');
  }

  componentDidMount () {
    const { searchSettings } = this.props;
    this.state = {
      searchType: searchSettings.searchType,
      zoomHandling: searchSettings.zoomHandling,
      observationRecency: searchSettings.observationRecency
    };
  }

  isChanged () {
    const { searchSettings } = this.props;
    return !_.isEqual(this.state, {
      searchType: searchSettings.searchType,
      zoomHandling: searchSettings.zoomHandling,
      observationRecency: searchSettings.observationRecency
    });
  }

  maybeSearch () {
    if (this.isChanged()) {
//      dispatch(actions.search(mapSettings.location, mapSettings.lat, mapSettings.lng, mapSettings.bounds,
//        searchSettings.observationRecency));
    }
    browserHistory.push('/');
  }

  getSearchRow () {
    const { location } = this.props.searchSettings;
    if (!location) {
      return false;
    }

    return (
      <footer>
        <button className="btn btn-primary" onClick={this.maybeSearch} disabled={!this.isChanged()}>
          <FormattedMessage id="search" />
        </button>
      </footer>
    );
  }

  render () {
    const { dispatch, searchSettings, intl } = this.props;

    const infoTooltip = (
      <Tooltip id="search-results-tooltip">
        <FormattedMessage id="autoZoomSetting" values={{
          autoZoom: <b>{intl.formatMessage({ id: 'autoZoom' })}</b>,
          showFullSearch: <b>{intl.formatMessage({ id: 'showFullSearchRange' })}</b>
         }} />
      </Tooltip>
    );

    return (
      <Overlay id="settings-overlay" onClose={this.close} showCloseIcon={true}>
        <div className="settings-row">
          <span className="settings-row-label"><FormattedMessage id="resultType" /></span>
          <span>
            <input type="radio" name="resultType" id="rt1"
              checked={searchSettings.searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.ALL}
              onChange={() => { dispatch(actions.setSearchType(C.SEARCH_SETTINGS.SEARCH_TYPES.ALL)); }} />
            <label htmlFor="rt1"><FormattedMessage id="birdSightings" /></label>
          </span>
          <span>
            <input type="radio" name="resultType" id="rt2"
              checked={searchSettings.searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.NOTABLE}
              onChange={() => { dispatch(actions.setSearchType(C.SEARCH_SETTINGS.SEARCH_TYPES.NOTABLE)); }} />
            <label htmlFor="rt2"><FormattedMessage id="notableSightings" /></label>
          </span>
        </div>

        <div className="settings-row">
          <span className="settings-row-label"><FormattedMessage id="searchResults" /></span>
          <span className="search-results">
            <span className="zoom-handling-auto-zoom">
              <input type="radio" name="zoomHandling" id="sr1"
                checked={searchSettings.zoomHandling === C.SEARCH_SETTINGS.ZOOM_HANDLING.AUTO_ZOOM}
                onChange={() => { dispatch(actions.setZoomHandling(C.SEARCH_SETTINGS.ZOOM_HANDLING.AUTO_ZOOM)); }} />
              <label htmlFor="sr1"><FormattedMessage id="autoZoom" /></label>
            </span>
            <span>
              <OverlayTrigger placement="left" overlay={infoTooltip}>
                <span className="zoom-tip glyphicon glyphicon-info-sign" />
              </OverlayTrigger>
              <input type="radio" name="zoomHandling" className="zoom-handling-full-search" id="sr2"
                checked={searchSettings.zoomHandling === C.SEARCH_SETTINGS.ZOOM_HANDLING.FULL_SEARCH}
                onChange={() => { dispatch(actions.setZoomHandling(C.SEARCH_SETTINGS.ZOOM_HANDLING.FULL_SEARCH)); }} />
              <label htmlFor="sr2"><FormattedMessage id="showFullSearchRange" /></label>
            </span>
          </span>
        </div>

        <div className="observation-recency-setting">
          <span>
            Show observations made in the last
            <DaysDropdown value={searchSettings.observationRecency}
              onChange={(val) => { dispatch(actions.setObservationRecency(val)); }} />days.
          </span>
        </div>

        {this.getSearchRow()}
      </Overlay>
    );
  }
}

export default injectIntl(connect(state => ({
  userLocationFound: state.user.userLocationFound,
  searchSettings: state.searchSettings,
  mapSettings: state.mapSettings
}))(SettingsOverlay));



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
