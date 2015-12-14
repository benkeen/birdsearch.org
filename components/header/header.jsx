import React from 'react';
import ReactDOM from 'react-dom';
import * as actions from './actions';
import { C, E, store, L } from '../../core/core';


class Header extends React.Component {
  render () {
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

  changeLang (e) {
    //store.dispatch();
    console.log(e.target.value);
  }

  render () {
    return (
      <ul className="nav pull-right">
        <li>
          <select id="lang" value={this.props.langFile} onChange={e => this.changeLang(e)}>
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

export default Header;

/*
 define([
 "mediator",
 "constants",
 "underscore",
 "moduleHelper",
 "text!headerTemplate"
 ], function(mediator, C, _, helper, template) {
 "use strict";

 var _MODULE_ID = "header";
 var _L = {};

 var _run = function() {
 var currentLangFile = helper.getCurrentLangFile();
 require([currentLangFile], function(L) {
 _L = L;
 var tmpl = _.template(template, {
 L: _L,
 currentLangFile: currentLangFile
 });
 $("header").html(tmpl);
 _addEventHandlers();
 });
 };

 var _addEventHandlers = function() {
 $("#aboutLink").on("click", function(e) {
 e.preventDefault();
 mediator.publish(_MODULE_ID, C.EVENT.ABOUT_LINK_CLICK);
 });

 $("#lang").on("change", function(e) {
 window.location = "?lang=" + $(e.target).val();
 });
 };

 mediator.register(_MODULE_ID, {
 run: _run
 });
 });
 */
