import React from 'react';
import { connect } from 'react-redux';
import { _ } from '../core/core';


class Overlay extends React.Component {
  render () {
    return (
      <div>

      </div>
    );
  }
}


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
    var classes = 'line-loader';
    if (this.props.className) {
      classes += ' ' + this.props.className;
    }

    return (
      <div className={classes}>
        <div className="bounce1"></div>
        <div className="bounce2"></div>
        <div className="bounce3"></div>
      </div>
    );
  }
}
LineLoader.PropTypes = {
  className: React.PropTypes.string
};


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

// draws a pretty count element with the appropriate colour for the # of species
class LocationSpeciesCount extends React.Component {
  render () {
    if (this.props.count === null) {
      return (<span>...</span>);
    }

    var className = 'range ';
    if (this.props.count < 10) {
      className += 'range1';
    } else if (this.props.count < 20) {
      className += 'range2';
    } else if (this.props.count < 30) {
      className += 'range3';
    } else if (this.props.count < 40) {
      className += 'range4';
    } else if (this.props.count < 50) {
      className += 'range5';
    } else if (this.props.count < 60) {
      className += 'range6';
    } else if (this.props.count < 70) {
      className += 'range7';
    } else {
      className += 'range8';
    }

    return (
      <span className={className}>{this.props.count}</span>
    );
  }
}
LocationSpeciesCount.PropTypes = {
  //count: React.PropTypes.number.isRequired // or null
};


export {
  Loader,
  ClosePanel,
  LineLoader,
  LocationsDropdown,
  LocationSpeciesCount
};
