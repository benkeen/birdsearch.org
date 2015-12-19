import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { FormattedMessage } from "react-intl"
import { Link } from 'react-router';
import * as actions from './actions';


class Header extends React.Component {
  render () {
    const { dispatch, locale } = this.props;

    return (
      <header className="flex-body">
        <div className="navbar">
          <h1 className="brand">birdsearch.org</h1>
        </div>

        <ul id="mainTabs">
          <li id="mapTab" className="active">
            <Link to="/"><FormattedMessage id="map" /></Link>
          </li>
          <li id="accountTab">
            <Link to="/account"><FormattedMessage id="login" /></Link>
          </li>
          <li id="aboutTab">
            <Link to="/about"><FormattedMessage id="help" /></Link>
          </li>
          <li id="searchTab">
            <Link to="/search">
              <i className="glyphicon glyphicon-search"></i>
              <FormattedMessage id="search" />
            </Link>
          </li>
        </ul>

        <LanguageToggle
          locale={locale}
          onChange={locale => dispatch(actions.setLocale(locale))} />
      </header>
    );
  }
}

export default connect(state => ({ locale: state.locale }))(Header)



class LanguageToggle extends React.Component {
  onChange (e) {
    e.preventDefault();
    this.props.onChange(e.target.value);
  }

  render () {
    return (
      <ul className="nav pull-right">
        <li>
          <select id="lang" value={this.props.locale} onChange={e => this.onChange(e)}>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="es">Español</option>
          </select>
        </li>
      </ul>
    );
  }
}

LanguageToggle.propTypes = {
  locale: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired
};

