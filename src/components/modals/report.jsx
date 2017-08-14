import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { browserHistory } from 'react-router';
import { Overlay, ClosePanel } from '../general/general';


class ReportSightingsOverlay extends React.Component {
  onClose () {
    browserHistory.push('/');
  }

  render () {
    return (
      <Overlay id="report-sightings-overlay" showCloseIcon={true} onClose={this.onClose}>
        <ClosePanel onClose={this.onClose} />
        <div>
          <p>
            <FormattedMessage id="reportSightingsText" values={{ link: <a href="http://ebird.org" target="_blank" rel="noopener noreferrer">eBird.org</a> }} />
          </p>
          <a href="http://ebird.org/ebird/submit" className="btn btn-primary" id="report-sightings-btn" target="_blank" rel="noopener noreferrer">
            <span className="glyphicon glyphicon-plus-sign" />
            <FormattedMessage id="reportSightings" />
          </a>
        </div>
      </Overlay>
    );
  }
}

export default injectIntl(connect(state => ({}))(ReportSightingsOverlay));

