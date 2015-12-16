import React from 'react';
import ReactDOM from 'react-dom';
import Redux from 'react-redux';
import { FormattedMessage } from "react-intl"
import * as actions from './actions';
import { C, E, L } from '../../core/core';


class Header extends React.Component {
  render () {

    // injected by connect()
    const { dispatch, lang } = this.props;

    return (
      <div className="flex-body">
        <div className="navbar">
          <h1 className="brand">birdsearch.org</h1>
        </div>

        <ul id="mainTabs">
          <li id="mapTab" className="active">
            <a href="#map">{L.map}</a>
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
          lang={lang}
          onChange={lang => dispatch(actions.selectLang(lang))} />
      </div>
    );
  }
}

function headerState(state) {
  return {
    lang: state.lang
  };
}

// wrap the component to inject dispatch and state into it
export default Redux.connect(headerState)(Header)




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
            id="something"
            description="Email Address label for the login form"
            defaultMessage="Email address" />

          <select id="lang" value={this.props.lang} onChange={e => this.onChange(e)}>
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
  lang: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired
};
