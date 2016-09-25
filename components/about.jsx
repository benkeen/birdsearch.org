import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { browserHistory, Link } from 'react-router';
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
        <img src="/images/photos/sandhill.png" width="200" className="photo" title="Sandhill crane, BC, Canada" />
        <p>
          <i>birdsearch.org</i> lets you search and browse recent worldwide bird sightings. Searches return observations
          made in the last <b>week</b> but you can search as far back as a <b>month</b> by editing
          the <Link to="/settings">search settings</Link>.
        </p>
        <p>
          The data is pulled from <a href="http://ebird.org" target="_blank">eBird.org</a> which provides many other
          options for viewing historical observation data. Check it out.
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
          Like many birders I know, discovering <a href="http://ebird.org" target="_blank">eBird</a> was a cause for
          celebration. It brought birding out of the dark ages of pen and pencil and into the digital age. Now we
          have a simple, centralized place to track observations, share knowledge and open up the data for everyone.
        </p>
        <p>
          But as a birder, I wanted a no-fuss high-level overview of a region; I wanted to see all observations being
          made in an area <i>right now</i>. The search options available on eBird are excellent, but don't quite fit
          the bill.
        </p>
        <p>
          Back in 2012 I wrote the first version of this site, now reworked and updated in 2016. The new site offers
          several key new improvements, like an improved user interface and wikipedia links for all bird species. Have fun!
        </p>
      </div>
    );
  }
}

class TranslateTab extends React.Component {
  render () {
    return (
      <div>
        <img src="/images/photos/magenta-throated-woodstar.png" width="200" className="photo" title="Magenta-throated woodstar, Costa Rica" />
        <p>
          Are you fluent in another language and would be interested in helping translate this site? The available
          languages are generated via Google Translate, so they're useful but not the highest quality. So if you're like to
          improve these, or add a new language to the mix, I'd like to hear from you. The translation files
          are <a href="https://github.com/benkeen/birdsearch.org/tree/master/core/i18n" target="_blank">found here</a>.
          Send me an email if you have any questions.
        </p>
      </div>
    );
  }
}

class ContactTab extends React.Component {
  render () {
    return (
      <div>
        <img src="/images/photos/snowy.png" width="200" className="photo" title="Snowy egret, Mexico" />
        <p>
          Found a bug? Have a feature suggestion? Don't like the way something behaves? I've love to hear from you.
          Make a comment on <a href="" target="_blank">this post</a> or send me an email
          at <a href="mailto:ben.keen@gmail.com">ben.keen@gmail.com</a>.
        </p>
        <p>
          Please note that this site is a hobby project, <a href="http://github.com/benkeen/birdsearch.org" target="_blank">open source</a>,
          and generates zero income. So if I don't respond right away, I'm probably out birding.
        </p>
      </div>
    );
  }
}

