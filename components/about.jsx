import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import { ClosePanel } from './general';
import { C, _, actions } from '../core/core';
import { Modal, Button } from 'react-bootstrap';


class AboutOverlay extends React.Component {
  constructor (props) {
    super(props);
  }

  close () {
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

  getTabContent () {

  }

  render () {
    const { selectedTab } = this.props;

    const aboutClasses = (selectedTab === C.ABOUT_TABS.ABOUT) ? 'active' : '';
    const thanksClasses = (selectedTab === C.ABOUT_TABS.THANKS) ? 'active' : '';
    const translateClasses = (selectedTab === C.ABOUT_TABS.TRANSLATE) ? 'active' : '';
    const contactClasses = (selectedTab === C.ABOUT_TABS.CONTACT) ? 'active' : '';

    return (
      <div className="tab-wrapper">
        <div id="map-overlay"></div>
        <div id="about-overlay" className="overlay">
          <div className="tab-content">
            <ClosePanel onClose={this.close} />

            <ul className="nav nav-pills">
              <li className={aboutClasses}><a href="#" onClick={(e) => this.selectTab(e, C.ABOUT_TABS.ABOUT)}>About</a></li>
              <li className={thanksClasses}><a href="#" onClick={(e) => this.selectTab(e, C.ABOUT_TABS.THANKS)}>Thanks</a></li>
              <li className={translateClasses}><a href="#" onClick={(e) => this.selectTab(e, C.ABOUT_TABS.TRANSLATE)}>Translate</a></li>
              <li className={contactClasses}><a href="#" onClick={(e) => this.selectTab(e, C.ABOUT_TABS.CONTACT)}>Contact</a></li>
            </ul>

            {this.getTabContent()}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  selectedTab: state.aboutOverlay.selectedTab
}))(AboutOverlay);
