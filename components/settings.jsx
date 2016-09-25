import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import { Overlay } from './general';
import { _, actions } from '../core/core';


class SettingsOverlay extends React.Component {
  constructor (props) {
    super(props);
  }

  close () {
    browserHistory.push('/');
  }

  render () {
    const { searchSettings } = this.props;

    return (
      <Overlay id="settings-overlay" onClose={this.close} showCloseIcon={true}>
        <div>
          <span>Result type:</span>
          <span className="result-type selected">
            <input type="radio" name="resultType" id="rt1" value="all" checked="checked" />
            <label htmlFor="rt1"><FormattedMessage id="birdSightings" /></label>
          </span>
          <span className="result-type">
            <input type="radio" name="resultType" id="rt2" value="notable" />
            <label htmlFor="rt2"><FormattedMessage id="notableSightings" /></label>
          </span>
        </div>

        <div>
          Show observations made in the last <DaysDropdown value={searchSettings.observationRecency}></DaysDropdown> days.
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
    var options = [];
    _.times(30, (i) => {
      let count = i + 1;
      options.push(<option value={count}>{count}</option>);
    });
    return options;
  }

  render () {
    return (
      <select className="num-days" value={this.props.value}>
        {this.getDays()}
      </select>
    );
  }
}
DaysDropdown.propTypes = {
  value: React.PropTypes.number.isRequired
};
