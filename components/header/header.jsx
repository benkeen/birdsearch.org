import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import * as actions from './../../core/actions';


class Header extends React.Component {
  render () {
    const { dispatch, locale, searchSettings, overlays } = this.props;

    return (
      <header className="flex-fill">
        <div className="navbar">
          <h1 className="brand">birdsearch.org</h1>
        </div>

        <HeaderSearch
          dispatch={dispatch}
          disabled={overlays.intro || overlays.advancedSearch}
          location={searchSettings.location}
          onChange={str => dispatch(actions.setSearchLocation(str))}
          onSubmit={() => dispatch(actions.search(searchSettings))} />

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
  locale: state.locale,
  overlays: state.overlays,
  searchSettings: state.searchSettings
}))(Header);


class HeaderSearch extends React.Component {
  constructor (props) {
    super(props);
    this.state = { showErrors: false };
  }

  componentDidMount () {
    var autoComplete = new google.maps.places.Autocomplete(ReactDOM.findDOMNode(this.refs.searchField));
    google.maps.event.addListener(autoComplete, 'place_changed', function () {
      var currPlace = autoComplete.getPlace();
      if (!currPlace.geometry) {
        return;
      }
      //_viewportObj = currPlace.geometry.hasOwnProperty("viewport") ? currPlace.geometry.viewport : null;
      //_locationObj = currPlace.geometry.location;

      this.props.dispatch(actions.searchAutoComplete());
    });
  }

  onChangeLocation (e) {
    e.preventDefault();
    this.props.onChange(e.target.value);
  }

  search () {
    if (this.props.location.trim() === '') {
      this.setState({ showErrors: true });
      return;
    }
    this.props.onSubmit();
  }

  render () {
    var searchBtnClasses = 'btn' + (!this.props.disabled ? ' btn-success' : '');
    return (
      <div className="header-search">
        <input type="text" placeholder="Enter Location" ref="searchField" value={this.props.location} onChange={this.onChangeLocation.bind(this)} />
        <button className={searchBtnClasses} onClick={this.search.bind(this)}><FormattedMessage id="search" /></button>
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
    this.props.onChange(e.target.value);
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

