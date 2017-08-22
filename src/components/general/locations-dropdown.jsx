import React, { Component } from 'react';
import PropTypes from 'prop-types';


export default class LocationsDropdown extends Component {
  getLocationRows () {
    return this.props.locations.map((location) => (
      <option value={location.i} key={location.i}>{location.n}</option>
    ));
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
  locations: PropTypes.array.isRequired,
  selected: PropTypes.string.isRequired
};
