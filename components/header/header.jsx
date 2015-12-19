import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { FormattedMessage } from "react-intl"
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
            <a href="#map"><FormattedMessage id="map" /></a>
          </li>
          <li id="accountTab">
            <a href="#account"><FormattedMessage id="login" /></a>
          </li>
          <li id="aboutTab">
            <a href="#about"><FormattedMessage id="help" /></a>
          </li>
          <li id="searchTab">
            <a href="#search">
              <i className="glyphicon glyphicon-search"></i>
              <FormattedMessage id="search" />
            </a>
          </li>
        </ul>

        <LanguageToggle
          locale={locale}
          onChange={locale => dispatch(actions.setLocale(locale))} />
      </header>
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

