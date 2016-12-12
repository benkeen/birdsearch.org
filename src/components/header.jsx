import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Link } from 'react-router';
import { browserHistory } from 'react-router';
import { VelocityTransitionGroup } from 'velocity-react';
import { OverlayTrigger, Tooltip, Popover } from 'react-bootstrap';
import { C, _, actions, helpers } from '../core/core';
import { LOCALES } from '../i18n/index';


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
      <header className="flex-fill">
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
      </header>
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



class HeaderSearch extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      showError: false,
      error: ''
    };
  }

  componentDidMount () {
    const { onSubmit, intl, setLocation } = this.props;

    let autoComplete = new google.maps.places.Autocomplete(ReactDOM.findDOMNode(this.refs.searchField));
    let selectedLocation;
    google.maps.event.addListener(autoComplete, 'place_changed', () => {
      var currPlace = autoComplete.getPlace();
      if (!currPlace.geometry) {
        return;
      }

      if (!currPlace.geometry.viewport || !currPlace.geometry.location) {
        setLocation(selectedLocation);
        this.setState({ showError: true, error: intl.formatMessage({ id: 'locationNotFound' }) });
        return;
      }

      if (currPlace.address_components.length < 3) {
        setLocation(selectedLocation);
        this.setState({ showError: true, error: intl.formatMessage({ id: 'pleaseEnterSpecificLocation' }) });
        return;
      }

      onSubmit({
        lat: currPlace.geometry.location.lat(),
        lng: currPlace.geometry.location.lng(),
        location: selectedLocation,
        bounds: helpers.getBestBounds(currPlace.geometry.viewport, currPlace.geometry.bounds)
      });
    });

    // hack workaround to get the exact location string that the user selected so we can pass it to React
    $(ReactDOM.findDOMNode(this.refs.searchField)).on('keyup', (e) => {
      if (e.keyCode == 13) {
        selectedLocation = e.target.value;
      }
    });
  }

  componentWillUpdate (nextProps, nextState) {
    if (nextState.showError && !this.state.showError) {
      setTimeout(() => { this.hideError(); }, C.ERROR_VISIBILITY_TIME);
    }
  }

  componentWillReceiveProps (nextProps) {
    const { intl, searchError } = this.props;

    // if an error is being fed in from a parent, only display it once. This relies on the reducer code resetting
    // the error to blank before setting it to a value again. Again, React handles one-offs like this very poorly.
    if (!searchError && nextProps.searchError) {
      this.setState({
        showError: true,
        error: intl.formatMessage({ id: nextProps.searchError }) });
    }
  }

  hideError () {
    this.setState({
      showError: false
    });
  }

  focus () {
    ReactDOM.findDOMNode(this.refs.searchField).focus();
  }

  onChangeLocation (e) {
    e.preventDefault();
    this.props.onChange(e.target.value);
  }

  render () {
    const { intl } = this.props;

    return (
      <div className="header-search">
        <input type="text" className="search-input-field" placeholder={intl.formatMessage({ id: 'enterLocation' })}
          ref="searchField" value={this.props.location} onChange={this.onChangeLocation.bind(this)} />

        <div className="location-error">
          <VelocityTransitionGroup enter={{ animation: 'slideDown' }} leave={{ animation: 'slideUp' }} component="div">
            {this.state.showError ? <div>{this.state.error}</div> : undefined}
          </VelocityTransitionGroup>
        </div>
      </div>
    );
  }
}
HeaderSearch.PropTypes = {
  disabled: React.PropTypes.bool.isRequired,
  location: React.PropTypes.string.isRequired,
  onChangeLocation: React.PropTypes.func.isRequired,
  onSubmit: React.PropTypes.func.isRequired,
  setLocation: React.PropTypes.func.isRequired,
  intl: intlShape.isRequired
};


// displays the locale selector as either a dropdown or HTML unordered list
class LocaleSelector extends React.Component {
  onChange (e) {
    e.preventDefault(); // needed? We could drop this if not....
    this.updateLocale(e.target.value);
  }

  updateLocale (newLocale) {
    const { locale, onChange } = this.props;
    $('body').removeClass(locale).addClass(newLocale);
    onChange(newLocale);
  }

  getLocaleOptions () {
    return _.map(LOCALES, (locale) => {
      return (
        <option value={locale.key} key={locale.key}>{locale.name}</option>
      );
    });
  }

  getLocalePills () {
    const { locale } = this.props;
    return _.map(LOCALES, (currLocale) => {
      let className = (locale === currLocale.key) ? 'active' : '';
      return (
        <li value={currLocale.key} className={className} key={currLocale.key}
          onClick={() => this.updateLocale(currLocale.key)}>{currLocale.name}</li>
      );
    });
  }

  render () {
    const { type, locale } = this.props;
    if (type === 'dropdown') {
      return (
        <select id="select-locale" className="form-control" value={locale} onChange={(e) => this.onChange(e)}>
          {this.getLocaleOptions()}
        </select>
      );
    }

    return (
      <ul className="nav-pills">
        {this.getLocalePills()}
      </ul>
    );
  }
}

LocaleSelector.propTypes = {
  type: React.PropTypes.string.isRequired, // oneOf syntax?
  locale: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired
};

