import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { browserHistory, Link } from 'react-router';
import { Modal, Button } from 'react-bootstrap';
import { Overlay, ClosePanel } from './general';
import { C, _, actions } from '../core/core';


class ReportSightingsOverlay extends React.Component {
  constructor (props) {
    super(props);
  }

  onClose () {
    browserHistory.push('/');
  }

  selectTab (e, tab) {
    e.preventDefault();
    const { selectedTab, dispatch } = this.props;
    if (tab === selectedTab) {
      return;
    }
    dispatch(actions.selectAboutTab(tab));
  }

  render () {
    return (
      <Overlay id="report-sightings-overlay" showCloseIcon={true} onClose={this.onClose}>
        <ClosePanel onClose={this.onClose} />
        <div>
          <p>
            The bird sightings listed on this site come from <a href="http://ebird.org">eBird.org</a>. Anyone in the
            world can sign up and submit their own observations. Click the button below to get started!
          </p>

          <a href="http://ebird.org/ebird/submit" className="btn btn-primary" id="report-sightings-btn" target="_blank">
            <span className="glyphicon glyphicon-plus-sign" />
            Report Sightings
          </a>
        </div>
      </Overlay>
    );
  }
}

export default injectIntl(connect(state => ({}))(ReportSightingsOverlay));

