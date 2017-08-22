import React, { Component } from 'react';
import PropTypes from 'prop-types';

// draws a pretty count element with the appropriate colour
export default class LocationCount extends Component {
  render () {
    const { count, classNameOverride } = this.props;

    if (count === null) {
      return (<span>...</span>);
    }

    let className = 'range ';

    if (classNameOverride) {
      className += ' ' + classNameOverride;
    } else if (count < 10) {
      className += 'range1';
    } else if (count < 20) {
      className += 'range2';
    } else if (count < 30) {
      className += 'range3';
    } else if (count < 40) {
      className += 'range4';
    } else if (count < 50) {
      className += 'range5';
    } else if (count < 60) {
      className += 'range6';
    } else if (count < 70) {
      className += 'range7';
    } else {
      className += 'range8';
    }

    return (
      <span className={className}>{count}</span>
    );
  }
}
LocationCount.PropTypes = {
  count: PropTypes.number,
  classNameOverride: PropTypes.string
};
LocationCount.defaultProps = {
  count: null,
  classNameOverride: null
};
