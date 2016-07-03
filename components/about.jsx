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
        <div id="about-overlay" className={overlayClass}>
          <div className="tab-wrapper">
            
            <ul>
              <li></li>
            </ul>
            <div className="tab-content">
              <ClosePanel onClose={this.close} />

              Search Type
              - bird sightings
              - notable sightings
              - locations

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

