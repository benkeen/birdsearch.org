import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { FormattedMessage } from "react-intl"
import * as actions from './actions';


class Header extends React.Component {
  render () {
    const { dispatch, locale } = this.props;

    console.log("new locale: ", locale);

    return (
      <div className="flex-body">
        <div className="navbar">
          <h1 className="brand">birdsearch.org</h1>
        </div>

        <ul id="mainTabs">
          <li id="mapTab" className="active">
            <a href="#map">Map</a>
          </li>
          <li id="accountTab">
            <a href="#account">Login</a>
          </li>
          <li id="aboutTab">
            <a href="#about">Help</a>
          </li>
          <li id="searchTab">
            <a href="#search">
              <i className="glyphicon glyphicon-search"></i>
              Search
            </a>
          </li>
        </ul>

        <LanguageToggle
          locale={locale}
          onChange={locale => dispatch(actions.setLocale(locale))} />
      </div>
    );
  }
}

function mapStateToProps (state) {
  return {
    locale: state.locale
  };
}

export default connect(mapStateToProps)(Header)



class LanguageToggle extends React.Component {
  onChange (e) {
    e.preventDefault();
    this.props.onChange(e.target.value);
  }

  render () {

    return (
      <ul className="nav pull-right">
        <li>
          <FormattedMessage
            id="bird_species"
            description="Email Address label for the login form"
            defaultMessage="Email address" />

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

