import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { C, helpers } from '../../core';
import { LocationCount } from '../general';


export default class LocationRow extends Component {
  render () {
    const { searchType, sightings, observationRecency, filter, location } = this.props;

    let count = null;
    let rowClass = 'loading';
    if (sightings.fetched) {
      count = sightings.data[observationRecency - 1].runningTotal;
      rowClass = '';
    }

    const classNameOverride = (searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.ALL) ? null : 'notableSighting';
    const locationNameData = helpers.highlightString(location.n, filter);
    return (
    <tr className={rowClass} data-location-id={location.i}>
      <td className="location">
        <div title={location.n} dangerouslySetInnerHTML={{ __html: locationNameData.string }}></div>
      </td>
      <td className="num-species">
        <LocationCount count={count} classNameOverride={classNameOverride} />
      </td>
    </tr>
    );
  }
}
LocationRow.PropTypes = {
  searchType: PropTypes.string.isRequired,
  location: PropTypes.object.isRequired,
  sightings: PropTypes.object.isRequired,
  observationRecency: PropTypes.number.isRequired,
  filter: PropTypes.string.isRequired
};

