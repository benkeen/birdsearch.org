import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { browserHistory, Link } from 'react-router';
import { Modal, Button } from 'react-bootstrap';
import { Overlay } from './general';
import { C, _, actions } from '../core/core';


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
    const { selectedTab, intl } = this.props;
    if (selectedTab === C.ABOUT_TABS.ABOUT) {
      return <AboutTab intl={intl} />;
    } else if (selectedTab === C.ABOUT_TABS.HISTORY) {
      return <HistoryTab intl={intl} />;
    } else if (selectedTab === C.ABOUT_TABS.TRANSLATE) {
      return <TranslateTab intl={intl} />;
    } else if (selectedTab === C.ABOUT_TABS.CONTACT) {
      return <ContactTab intl={intl} />;
    }
  }

  render () {
    const { selectedTab } = this.props;

    const aboutClasses = (selectedTab === C.ABOUT_TABS.ABOUT) ? 'active' : '';
    const historyClasses = (selectedTab === C.ABOUT_TABS.HISTORY) ? 'active' : '';
    const translateClasses = (selectedTab === C.ABOUT_TABS.TRANSLATE) ? 'active' : '';
    const contactClasses = (selectedTab === C.ABOUT_TABS.CONTACT) ? 'active' : '';

    return (
      <Overlay id="about-overlay" showCloseIcon={true} onClose={this.close}>
        <div>
          <ul className="nav nav-pills">
            <li className={aboutClasses}><a href="#" onClick={(e) => this.selectTab(e, C.ABOUT_TABS.ABOUT)}><FormattedMessage id="about" /></a></li>
            <li className={historyClasses}><a href="#" onClick={(e) => this.selectTab(e, C.ABOUT_TABS.HISTORY)}><FormattedMessage id="history" /></a></li>
            <li className={translateClasses}><a href="#" onClick={(e) => this.selectTab(e, C.ABOUT_TABS.TRANSLATE)}><FormattedMessage id="translate" /></a></li>
            <li className={contactClasses}><a href="#" onClick={(e) => this.selectTab(e, C.ABOUT_TABS.CONTACT)}><FormattedMessage id="contact" /></a></li>
          </ul>
          {this.getTabContent()}
        </div>
      </Overlay>
    );
  }
}

export default injectIntl(connect(state => ({
  selectedTab: state.aboutOverlay.selectedTab
}))(AboutOverlay));



class AboutTab extends React.Component {
  render () {
    const { intl } = this.props;

    return (
      <div>
        <img src="/images/photos/sandhill.png" width="200" className="photo" title="Sandhill crane, BC, Canada" />
        <p>
          <FormattedMessage id="aboutPara1"
            values={{
              birdsearchSite: <i>birdsearch.org</i>,
              week: <b>{intl.formatMessage({ id: 'week' })}</b>,
              month: <b>{intl.formatMessage({ id: 'month' })}</b>,
              settingsLink: <Link to="/settings">{intl.formatMessage({ id: 'searchSettings' }).toLowerCase()}</Link>
            }} />
        </p>
        <p>
          <FormattedMessage id="aboutPara2"
            values={{ eBirdSiteLink: <a href="http://ebird.org" target="_blank">eBird.org</a> }} />
        </p>
      </div>
    );
  }
}

class HistoryTab extends React.Component {
  render () {
    const { intl } = this.props;

    return (
      <div>
        <p>
          <FormattedMessage id="historyPara1"
            values={{ eBirdSiteLink: <a href="http://ebird.org" target="_blank">eBird.org</a> }} />
        </p>
        <p>
          <FormattedMessage id="historyPara2" values={{ rightNow: <i>{intl.formatMessage({ id: 'rightNow' })}</i> }} />
        </p>
        <p>
          <FormattedMessage id="historyPara3" />
        </p>
      </div>
    );
  }
}

class TranslateTab extends React.Component {
  render () {
    const { intl } = this.props;

    return (
      <div>
        <img src="/images/photos/magenta-throated-woodstar.png" width="200" className="photo" title="Magenta-throated woodstar, Costa Rica" />
        <p>
          <FormattedMessage id="translatePara1" 
            values={{
              githubLink: <a href="https://github.com/benkeen/birdsearch.org/tree/master/src/i18n" target="_blank">{intl.formatMessage({ id: 'foundHere' })}</a>
            }} />
        </p>
      </div>
    );
  }
}

class ContactTab extends React.Component {
  render () {
    const { intl } = this.props;

    return (
      <div>
        <img src="/images/photos/snowy.png" width="200" className="photo" title="Snowy egret, Mexico" />
        <p>
          <FormattedMessage id="contactPara1"
            values={{
              postLink: <a href="" target="_blank">{intl.formatMessage({ id: 'thisPost' })}</a>,
              email: <a href="mailto:ben.keen@gmail.com">ben.keen@gmail.com</a>
            }} />
        </p>
        <p>
          <FormattedMessage id="contactPara2"
            values={{
              openSourceLink: <a href="http://github.com/benkeen/birdsearch.org" target="_blank">{intl.formatMessage({ id: 'openSource' })}</a>
            }} />
        </p>
      </div>
    );
  }
}

