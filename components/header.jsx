import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import { browserHistory } from 'react-router';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { C, _, actions, helpers } from '../core/core';
import { LOCALES } from '../core/i18n/index';


class Header extends React.Component {
  componentWillMount () {
    this.showIntroOverlay = this.showIntroOverlay.bind(this);
    this.onSubmitNewSearch = this.onSubmitNewSearch.bind(this);
  }

  componentDidUpdate (prevProps) {
    if (prevProps.nextAction !== this.props.nextAction && this.props.nextAction === C.ONE_OFFS.MAIN_SEARCH_FIELD_FOCUS) {
      this.refs.headerSearch.focus();
    }
  }

  showIntroOverlay () {
    const { dispatch } = this.props;
    dispatch(actions.showModal());
    browserHistory.push('/intro');
  }

  onSubmitNewSearch (mapSettings) {
    const { dispatch, searchSettings } = this.props;
    dispatch(actions.search(mapSettings.location, mapSettings.lat, mapSettings.lng, mapSettings.bounds,
      searchSettings.limitByObservationRecency, searchSettings.observationRecency));
  }

  showAboutOverlay (e) {
    e.preventDefault();
    const { dispatch } = this.props;
    dispatch(actions.showModal());
    browserHistory.push('/about');
  }

  render () {
    const { dispatch, locale, searchSettings, introOverlay, advancedSearchOverlay } = this.props;
//    const userTooltip = <Tooltip id="user-tooltip"><FormattedMessage id="loginCreateAccount" /></Tooltip>;
    const infoTooltip = <Tooltip id="info-tooltip"><FormattedMessage id="aboutBirdsearch" /></Tooltip>;

//    <li>
//      <OverlayTrigger placement="bottom" overlay={userTooltip}>
//        <Link to="/account" className="icon icon-user"></Link>
//      </OverlayTrigger>
//    </li>

    return (
      <header className="flex-fill">
        <div className="navbar" onClick={this.showIntroOverlay}>
          <h1 className="brand">birdsearch.org</h1>
          <span className="beta">BETA</span>
        </div>

        <HeaderSearch
          ref="headerSearch"
          disabled={introOverlay.visible || advancedSearchOverlay.visible}
          location={searchSettings.location}
          onChange={(str) => dispatch(actions.setSearchLocation(str))}
          onSubmit={this.onSubmitNewSearch} />

        <ul className="nav-items">
          <li>
            <OverlayTrigger placement="bottom" overlay={infoTooltip}>
              <a href="#" onClick={(e) => this.showAboutOverlay(e)} className="icon icon-info"></a>
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

export default connect(state => ({
  locale: state.storedSettings.locale,
  introOverlay: state.introOverlay,
  advancedSearchOverlay: state.advancedSearchOverlay,
  searchSettings: state.searchSettings,
  nextAction: state.misc.nextAction
}))(Header);


class HeaderSearch extends React.Component {
  constructor (props) {
    super(props);
    this.state = { showErrors: false };
  }

  componentDidMount () {
    const { onSubmit } = this.props;

    var autoComplete = new google.maps.places.Autocomplete(ReactDOM.findDOMNode(this.refs.searchField));
    google.maps.event.addListener(autoComplete, 'place_changed', (hm) => {
      var currPlace = autoComplete.getPlace();
      if (!currPlace.geometry) {
        return;
      }

      onSubmit({
        lat: currPlace.geometry.location.lat(),
        lng: currPlace.geometry.location.lng(),
        location: currPlace.formatted_address,
        bounds: helpers.getBestBounds(currPlace.geometry.viewport, currPlace.geometry.bounds)
      });
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
    const advancedSearchTooltip = <Tooltip id="advanced-search-tooltip"><FormattedMessage id="advancedSearch" /></Tooltip>;

    return (
      <div className="header-search">
        <input type="text" placeholder="Enter Location" ref="searchField" value={this.props.location}
          onChange={this.onChangeLocation.bind(this)} />
        <OverlayTrigger placement="bottom" overlay={advancedSearchTooltip}>
          <Link className="icon icon-search advanced-search-link" to="/advanced-search" />
        </OverlayTrigger>
      </div>
    );
  }
}
HeaderSearch.PropTypes = {
  disabled: React.PropTypes.bool.isRequired,
  location: React.PropTypes.string.isRequired,
  onChangeLocation: React.PropTypes.func.isRequired,
  onSubmit: React.PropTypes.func.onSubmit
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

