import React from 'react';
import ReactDOM from 'react-dom';
import { C, store, L } from '../../core/core';


class Header extends React.Component {
  render () {
    return (
      <div>
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
        <LanguageToggle langFile="en_us" />
      </div>
    );
  }
}

// lang_en, lang_fr etc.
class LanguageToggle extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    return (
      <ul className="nav pull-right">
        <li>
          <select id="lang" value={this.props.langFile}>
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
  langFile: React.PropTypes.string.isRequired
};
Counter.defaultProps = { langFile: 'lang_en' };


export default Header;
