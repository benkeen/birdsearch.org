import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import { C, actions, helpers } from '../core/core';


class Header extends React.Component {
  componentDidUpdate (prevProps) {
    if (prevProps.nextAction !== this.props.nextAction && this.props.nextAction === C.ONE_OFFS.MAIN_SEARCH_FIELD_FOCUS) {
      this.refs.headerSearch.focus();
    }
  }

  render () {
    const { dispatch, locale, searchSettings, overlayVisibility } = this.props;

    return (
      <header className="flex-fill">
        <div className="navbar">
          <h1 className="brand">birdsearch.org</h1>
        </div>

        <HeaderSearch
          ref="headerSearch"
          disabled={overlayVisibility.intro || overlayVisibility.advancedSearch}
          location={searchSettings.location}
          onChange={str => dispatch(actions.setSearchLocation(str))}
          onSubmit={locationInfo => dispatch(actions.search(searchSettings, locationInfo))} />

        <ul className="nav-items">
          <li>
            <Link to="/account"><FormattedMessage id="login" /></Link>
          </li>
          <li>
            <Link to="/about"><FormattedMessage id="about" /></Link>
          </li>
          <li className="lang-toggle">
            <LanguageToggle
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
  overlayVisibility: state.overlayVisibility,
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
    google.maps.event.addListener(autoComplete, 'place_changed', () => {
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
    return (
      <div className="header-search">
        <input type="text" placeholder="Enter Location" ref="searchField" value={this.props.location}
          onChange={this.onChangeLocation.bind(this)} />
        <Link className="advanced-search-link" to="/advanced-search"><FormattedMessage id="advancedSearch" /></Link>
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


class LanguageToggle extends React.Component {
  onChange (e) {
    e.preventDefault();
    const newLocale = e.target.value;
    $('body').removeClass(this.props.locale).addClass(newLocale);
    this.props.onChange(newLocale);
  }

  render () {
    return (
      <select id="select-locale" value={this.props.locale} onChange={e => this.onChange(e)}>
        <option value="en">English</option>
        <option value="fr">Français</option>
        <option value="de">Deutsch</option>
        <option value="es">Español</option>
      </select>
    );
  }
}

LanguageToggle.propTypes = {
  locale: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired
};

