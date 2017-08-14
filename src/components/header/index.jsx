import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { browserHistory } from 'react-router';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import StyledHeader from './header-style';
import HeaderSearch from './header-search';
import { C, _, actions } from '../../core/core';
import LocaleSelector from '../general/locale-selector';


class Header extends React.Component {
  componentWillMount () {
    this.showIntroOverlay = this.showIntroOverlay.bind(this);
    this.onSubmitNewSearch = this.onSubmitNewSearch.bind(this);
    this.setLocation = this.setLocation.bind(this);
    this.showSettingsOverlay = this.showSettingsOverlay.bind(this);
    this.maybeCloseMobileNav = this.maybeCloseMobileNav.bind(this);
  }

  componentDidUpdate (prevProps) {
    const { dispatch } = this.props;
    if (prevProps.nextAction !== this.props.nextAction && this.props.nextAction === C.ONE_OFFS.MAIN_SEARCH_FIELD_FOCUS) {
      this.refs.headerSearch.focus();
      dispatch(actions.clearNextAction());
    }
  }

  showIntroOverlay () {
    const { dispatch } = this.props;
    dispatch(actions.showModal());
    browserHistory.push('/intro');
    this.maybeCloseMobileNav();
  }

  onSubmitNewSearch ({ location, lat, lng, bounds }) {
    const { dispatch, viewportMode } = this.props;
    const { searchType, observationRecency, zoomHandling } = this.props.settingsOverlay;

    // this is here for the scenario where a user STARTS on /search. In that case we want to prevent the intro modal
    // from appearing
    dispatch(actions.setIntroOverlayVisibility(false));

    // now ensure the URL is the root
    browserHistory.push('/');
    const showLocationsPanel = (viewportMode === C.VIEWPORT_MODES.DESKTOP);
    dispatch(actions.search(searchType, location, lat, lng, bounds, observationRecency, zoomHandling, showLocationsPanel));
  }

  setLocation (location) {
    const { dispatch } = this.props;
    dispatch(actions.setSearchLocation(location));
  }

  showAboutOverlay (e) {
    e.preventDefault();
    $(e.target).trigger('blur');
    browserHistory.push('/about');
    this.maybeCloseMobileNav();
  }

  showSettingsOverlay (e) {
    e.preventDefault();
    $(e.target).trigger('blur');
    browserHistory.push('/settings');
    this.maybeCloseMobileNav();
  }

  showReportSightingsOverlay (e) {
    e.preventDefault();
    browserHistory.push('/report');
  }

  // closes the mobile navigation if the user is on mobile & the nav is open
  maybeCloseMobileNav () {
    const { viewportMode } = this.props;
    if (viewportMode !== C.VIEWPORT_MODES.MOBILE) {
      return;
    }
    const $navButton = $(ReactDOM.findDOMNode(this.refs.mobileNavButton));
    const $nav       = $(ReactDOM.findDOMNode(this.refs.mobileNav));
    if ($nav.hasClass('in')) {
      $navButton.trigger('click');
    }
  }

  render () {
    const { dispatch, locale, searchSettings, introOverlay, settingsOverlay, searchError, intl } = this.props;
    const searchSettingsTooltip = <Tooltip id="search-settings-tooltip"><FormattedMessage id="settings" /></Tooltip>;
    const infoTooltip = <Tooltip id="info-tooltip"><FormattedMessage id="about" /></Tooltip>;
    const reportSightingsTooltip = <Tooltip id="report-sightings-tooltip"><FormattedMessage id="reportBirdSightings" /></Tooltip>;

    return (
      <StyledHeader className="flex-fill">
        <div className="navbar navbar-header" onClick={this.showIntroOverlay}>
          <h1 className="brand">birdsearch.org</h1>
          <span className="beta">BETA</span>
        </div>

        <button type="button" className="navbar-toggle collapsed" ref="mobileNavButton" data-toggle="collapse" data-target="#mobile-navbar"
          onClick={() => dispatch(actions.hideSearchTooltip(false))}>
          <span className="sr-only">Toggle navigation</span>
          <span className="icon-bar" />
          <span className="icon-bar" />
          <span className="icon-bar" />
        </button>

        <HeaderSearch
          ref="headerSearch"
          disabled={introOverlay.visible || settingsOverlay.visible}
          location={searchSettings.location}
          searchError={searchError}
          onChange={(str) => dispatch(actions.setSearchLocation(str))}
          intl={intl}
          onSubmit={this.onSubmitNewSearch}
          setLocation={this.setLocation} />

        <ul className="nav-items">
          <li>
            <OverlayTrigger placement="bottom" overlay={searchSettingsTooltip}>
              <a href="#" onClick={(e) => this.showSettingsOverlay(e)} className="icon icon-cog" />
            </OverlayTrigger>
          </li>
          <li>
            <OverlayTrigger placement="bottom" overlay={infoTooltip}>
              <a href="#" onClick={(e) => this.showAboutOverlay(e)} className="icon icon-info" />
            </OverlayTrigger>
          </li>
          <li>
            <OverlayTrigger placement="bottom" overlay={reportSightingsTooltip}>
              <button className="report-sightings-icon btn btn-success" onClick={(e) => this.showReportSightingsOverlay(e)}>
                <span className="glyphicon glyphicon-plus-sign" />
              </button>
            </OverlayTrigger>
          </li>
          <li className="lang-toggle">
            <LocaleSelector
              type="dropdown"
              locale={locale}
              onChange={locale => dispatch(actions.setLocale(locale))} />
          </li>
        </ul>

        <ul id="mobile-navbar" className="collapse navbar-collapse" ref="mobileNav">
          <li><a href="#" onClick={(e) => this.showSettingsOverlay(e)}><FormattedMessage id="settings" /></a></li>
          <li><a href="#" onClick={(e) => this.showAboutOverlay(e)}><FormattedMessage id="about" /></a></li>
          <li className="mobile-local-selector">
            <LocaleSelector
              type="pills"
              locale={locale}
              onChange={(locale) => { this.maybeCloseMobileNav(); dispatch(actions.setLocale(locale)) }} />
          </li>
        </ul>
      </StyledHeader>
    );
  }
}

export default injectIntl(connect(state => ({
  locale: state.user.locale,
  introOverlay: state.introOverlay,
  settingsOverlay: state.settingsOverlay,
  searchSettings: state.searchSettings,
  nextAction: state.misc.nextAction,
  searchError: state.results.searchError,
  viewportMode: state.env.viewportMode
}))(Header));
