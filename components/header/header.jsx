import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
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
export default connect(headerState)(Header)




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
  lang: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};


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
