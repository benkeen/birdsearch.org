import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import { Overlay } from './general';
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
    const { selectedTab } = this.props;
    if (selectedTab === C.ABOUT_TABS.ABOUT) {
      return <AboutTab />;
    } else if (selectedTab === C.ABOUT_TABS.HISTORY) {
      return <HistoryTab />;
    } else if (selectedTab === C.ABOUT_TABS.TRANSLATE) {
      return <TranslateTab />;
    } else if (selectedTab === C.ABOUT_TABS.CONTACT) {
      return <ContactTab />;
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
            <li className={aboutClasses}><a href="#" onClick={(e) => this.selectTab(e, C.ABOUT_TABS.ABOUT)}>About</a></li>
            <li className={historyClasses}><a href="#" onClick={(e) => this.selectTab(e, C.ABOUT_TABS.HISTORY)}>History</a></li>
            <li className={translateClasses}><a href="#" onClick={(e) => this.selectTab(e, C.ABOUT_TABS.TRANSLATE)}>Translate</a></li>
            <li className={contactClasses}><a href="#" onClick={(e) => this.selectTab(e, C.ABOUT_TABS.CONTACT)}>Contact</a></li>
          </ul>
          {this.getTabContent()}
        </div>
      </Overlay>
    );
  }
}

export default connect(state => ({
  selectedTab: state.aboutOverlay.selectedTab
}))(AboutOverlay);



class AboutTab extends React.Component {
  render () {
    return (
      <div>
        <img src="/images/sandhill.png" width="200" className="photo" />

        <p>
          birdsearch.org lets you browse and search recent worldwide bird sightings. Searching returns observations
          data made in the last <b>week</b>, but the advanced search allows you to search as far back as a <b>month</b>.
        </p>
        <p>
          The data is pulled from <a href="http://ebird.org" target="_blank">eBird.org</a> which provides several other
          options for viewing - and even downloading - observation data. Check it out!
        </p>
      </div>
    );
  }
}

class HistoryTab extends React.Component {
  render () {
    return (
      <div>
        <p>
          Like many birders I know, discovering <a href="http://ebird.org" target="_blank">eBird</a> was an milestone.
          It brought birding out of the dark ages of pen-and-pencil logs and into the digital age. Now we could
          share our knowledge, track observations and open up the information for use by others.
        </p>
        <p>
          But as a birder, I wanted a no-fuss high-level overview of a region. I wanted to specify a location and see
          all observations being made <i>right now</i>. The current search options available on the eBird site are
          excellent, but still don't quite answer.
        </p>
        <p>
          Back in 2012 I wrote the first version of this site, now updated in 2016.
        </p>
      </div>
    );
  }
}

class TranslateTab extends React.Component {
  render () {
    return (
      <div>
        <p>
          If you're interested in helping translate this site, I'd love to hear from you. The available
          languages are all generated via Google Translate, so while useful, they're not of the highest quality.
          The source code and translations are found on
          <a href="https://github.com/benkeen/birdsearch.org/tree/master/core/i18n">github.com here</a>.
        </p>
      </div>
    );
  }
}

class ContactTab extends React.Component {
  render () {
    return (
      <div>
        <p>
          Found a bug? Got a feature suggestion? I've love to hear from you. Make a comment on <a href="">this post</a> or
          email me at <a href="mailto:ben.keen@gmail.com">ben.keen@gmail.com</a>.
        </p>
      </div>
    );
  }
}

