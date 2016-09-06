import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import { ClosePanel } from './general';
import { C, _, actions } from '../core/core';
import { Modal, Button } from 'react-bootstrap';


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

//          <div className="tab-wrapper">
//            <ul>
//              <li></li>
//            </ul>
//            <div className="tab-content">
//
//            </div>
//          </div>

    return (
      <div>
        <div id="map-overlay"></div>
        <div id="about-overlay" className={overlayClass}>

          <Modal.Dialog>
            <Modal.Header>
              <Modal.Title>About</Modal.Title>
              <ClosePanel onClose={this.close} />
            </Modal.Header>

            <Modal.Body>

              Search Type
              - bird sightings
              - notable sightings
              - locations
              - Num days to search

            </Modal.Body>

            <Modal.Footer>
              <Button>Close</Button>
              <Button bsStyle="primary">Save changes</Button>
            </Modal.Footer>
          </Modal.Dialog>

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

