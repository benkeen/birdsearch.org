import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import { Loader, ClosePanel } from './general';
import { C, _, actions } from '../core/core';


class AdvancedSearchOverlay extends React.Component {
  constructor (props) {
    super(props);
  }

  close () {
    browserHistory.push('/');
  }

  render () {
    const { loading } = this.props;
    const overlayClass = 'overlay' + ((loading) ? ' loading' : '');

    return (
      <div>
        <div id="map-overlay"></div>
        <div id="advanced-search-overlay" className={overlayClass}>

          <div className="tab-wrapper">
            {this.getLoader()}

            <div className="tab-content">
              <ClosePanel onClose={this.close} />

              <ul id="resultTypeGroup">
                <li class="selected">
                  <input type="radio" name="resultType" id="rt1" value="all" checked="checked" />
                  <label for="rt1"><FormattedMessage id="birdSightings" /></label>
                </li>
                <li>
                  <input type="radio" name="resultType" id="rt2" value="notable" />
                  <label for="rt2"><FormattedMessage id="notableSightings" /></label>
                </li>
                <li>
                  <input type="radio" name="resultType" id="rt3" value="hotspots" />
                  <label for="rt3"><FormattedMessage id="birdingLocations" /></label>
                </li>
              </ul>

              - Num days to search

            </div>
          </div>

        </div>
      </div>
    );
  }
}

export default connect(state => ({
  userLocationFound: state.user.userLocationFound,
  searchSettings: state.searchSettings,
  mapSettings: state.mapSettings
}))(AdvancedSearchOverlay);

