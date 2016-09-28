import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import { Overlay } from './general';
import { C, _, actions } from '../core/core';


class SettingsOverlay extends React.Component {
  constructor (props) {
    super(props);
  }

  close () {
    browserHistory.push('/');
  }

  render () {
    const { dispatch, searchSettings } = this.props;
    const allClass = 'result-type' + ((searchSettings.searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.ALL) ? ' selected' : '');
    const notableClass = 'result-type' + ((searchSettings.searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.NOTABLE) ? ' selected' : '');

    return (
      <Overlay id="settings-overlay" onClose={this.close} showCloseIcon={true}>

        <div className="result-type-row">
          <span className="result-type-label">Result type</span>
          <span className={allClass}>
            <input type="radio" name="resultType" id="rt1"
              checked={searchSettings.searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.ALL}
              onChange={() => { dispatch(actions.setSearchType(C.SEARCH_SETTINGS.SEARCH_TYPES.ALL)); }} />
            <label htmlFor="rt1"><FormattedMessage id="birdSightings" /></label>
          </span>
          <span className={notableClass}>
            <input type="radio" name="resultType" id="rt2"
              checked={searchSettings.searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.NOTABLE}
              onChange={() => { dispatch(actions.setSearchType(C.SEARCH_SETTINGS.SEARCH_TYPES.NOTABLE)); }} />
            <label htmlFor="rt2"><FormattedMessage id="notableSightings" /></label>
          </span>
        </div>

        <div className="result-type-row">
          <span className="result-type-label">Zooming</span>
          <span className={allClass}>
            Auto-zoom
          </span>
          <span className={allClass}>
            Show full search range
          </span>
        </div>

This setting controls how the map should behave after a search. <b>Auto-zoom</b> sets the zoom level 
appropriately, based on your search. <b>Show full search</b> zooms out to show the entire search.

        <div>
          Show observations made in the last
          <DaysDropdown value={searchSettings.observationRecency}
            onChange={(val) => { dispatch(actions.setObservationRecency(val)); }} />days.
        </div>
      </Overlay>
    );
  }
}

export default connect(state => ({
  userLocationFound: state.user.userLocationFound,
  searchSettings: state.searchSettings,
  mapSettings: state.mapSettings
}))(SettingsOverlay);



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
