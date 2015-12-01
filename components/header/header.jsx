import React from 'react';
import ReactDOM from 'react-dom';
import { C, store, L } from '../../core/core.jsx';

export default class Header extends React.Component {
  render () {

    //<ul class="nav pull-right">
    //  <li>
    //    <select id="lang">
    //      <option value="en"<% if (currentLangFile === "lang_en"){%> selected="selected"<% } %>>English</option>
    //      <option value="fr"<% if (currentLangFile === "lang_fr"){%> selected="selected"<% } %>>Français</option>
    //      <option value="de"<% if (currentLangFile === "lang_de"){%> selected="selected"<% } %>>Deutsch</option>
    //      <option value="es"<% if (currentLangFile === "lang_es"){%> selected="selected"<% } %>>Español</option>
    //    </select>
    //  </li>
    //</ul>

    return (
      <div>
        <div class="navbar">
          <h1 class="brand">birdsearch.org</h1>
        </div>

        <ul id="mainTabs">
          <li id="mapTab" class="active">
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
              <i class="glyphicon glyphicon-search"></i>
              Search
            </a>
          </li>
        </ul>
      </div>
    );
  }
};

