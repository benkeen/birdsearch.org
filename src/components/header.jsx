import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Link } from 'react-router';
import { browserHistory } from 'react-router';
import { VelocityTransitionGroup } from 'velocity-react';
import { OverlayTrigger, Tooltip, Popover } from 'react-bootstrap';
import { C, _, actions, helpers } from '../core/core';
import { ClosePanel } from './general';
import { LOCALES } from '../i18n/index';


class Header extends React.Component {
  componentWillMount () {
    this.showIntroOverlay = this.showIntroOverlay.bind(this);
    this.onSubmitNewSearch = this.onSubmitNewSearch.bind(this);
    this.setLocation = this.setLocation.bind(this);
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
  }

  onSubmitNewSearch ({ location, lat, lng, bounds }) {
    const { dispatch } = this.props;
    const { searchType, observationRecency, zoomHandling } = this.props.settingsOverlay;
    dispatch(actions.search(searchType, location, lat, lng, bounds, observationRecency, zoomHandling));
  }

  setLocation (location) {
    const { dispatch } = this.props;
    dispatch(actions.setSearchLocation(location));
  }

  showAboutOverlay (e) {
    e.preventDefault();
    browserHistory.push('/about');
  }

  showSettingsOverlay (e) {
    e.preventDefault();
    browserHistory.push('/settings');
  }

  render () {
    const { dispatch, locale, searchSettings, introOverlay, settingsOverlay, searchError, intl } = this.props;
    const searchSettingsTooltip = <Tooltip id="search-settings-tooltip"><FormattedMessage id="settings" /></Tooltip>;
    const infoTooltip = <Tooltip id="info-tooltip"><FormattedMessage id="about" /></Tooltip>;

    return (
      <header className="flex-fill">
        <div className="navbar" onClick={this.showIntroOverlay}>
          <h1 className="brand">birdsearch.org</h1>
          <span className="beta">BETA</span>
        </div>

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
          <li className="lang-toggle">
            <LocaleToggle
              locale={locale}
              onChange={locale => dispatch(actions.setLocale(locale))} />
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
  searchError: state.results.searchError
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
          <input type="text" placeholder={intl.formatMessage({ id: 'enterLocation' })} ref="searchField" value={this.props.location}
            onChange={this.onChangeLocation.bind(this)} />

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


class LocaleToggle extends React.Component {
  onChange (e) {
    e.preventDefault();
    const newLocale = e.target.value;
    $('body').removeClass(this.props.locale).addClass(newLocale);
    this.props.onChange(newLocale);
  }

  getLocales () {
    return _.map(LOCALES, (locale) => {
      return (
        <option value={locale.key} key={locale.key}>{locale.name}</option>
      );
    });
  }

  render () {
    return (
      <select id="select-locale" value={this.props.locale} onChange={e => this.onChange(e)}>
        {this.getLocales()}
      </select>
    );
  }
}

LocaleToggle.propTypes = {
  locale: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired
};

