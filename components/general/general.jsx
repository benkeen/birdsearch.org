import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { _ } from '../../core/core';


class Loader extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    return (
      <div className="loader">
        <div className="cssload-loader">
          <div className="cssload-side"></div>
          <div className="cssload-side"></div>
          <div className="cssload-side"></div>
          <div className="cssload-side"></div>
          <div className="cssload-side"></div>
          <div className="cssload-side"></div>
          <div className="cssload-side"></div>
          <div className="cssload-side"></div>
        </div>
        <div className="loader-label">{this.props.label}</div>
      </div>
    );
  }
}

Loader.PropTypes = {
  label: React.PropTypes.string
};
Loader.defaultProps = {
  label: 'Loading...'
};


class ClosePanel extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    return (
      <span className="close-panel glyphicon glyphicon-remove-circle" onClick={this.props.onClose}></span>
    );
  }
}
ClosePanel.PropTypes = {
  onClose: React.PropTypes.func.isRequired
};


class LineLoader extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    return (
      <div className="line-loader">
        <div className="bounce1"></div>
        <div className="bounce2"></div>
        <div className="bounce3"></div>
      </div>
    );
  }
}


class LocationsDropdown extends React.Component {
  constructor (props) {
    super(props);
  }

  getLocationRows () {
    return _.map(this.props.locations, function (location) {
      return (<option value={location.i} key={location.i}>{location.n}</option>);
    });
  }

  render () {
    return (
      <select value={this.props.selected} >
        <option value="">All Locations</option>
        {this.getLocationRows()}
      </select>
    );
  }
}
LocationsDropdown.PropTypes = {
  locations: React.PropTypes.array.isRequired,
  selected: React.PropTypes.string.isRequired
};

export {
  Loader,
  ClosePanel,
  LineLoader,
  LocationsDropdown
};
