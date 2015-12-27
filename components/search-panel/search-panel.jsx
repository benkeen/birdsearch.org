import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';


class SearchPanel extends React.Component {

  getRangeField () {

    if (this.props.searchType === 'birds') {
      return (
        <div id="observationRecencySection">
          <label htmlFor="observationRecency">

            {L.show_obs_made_within_last} <span id="observationRecencyDisplay">{this.props.observationRecency}</span> {L.day_or_days}
          </label>
          <ol className="rangeTip">
            <li className="rangeTipLeft">1</li>
            <li><input type="range" id="observationRecency" min="1" max="30" value={this.props.observationRecency} /></li>
            <li className="rangeTipRight">30</li>
          </ol>
        </div>
      );
    }

    if (this.props.searchType === 'hotspots') {

      //{L.limit_to_locations} <span id="hotspotActivityRecencyDisplay">{this.props.observationRecency}</span> {L.day_or_days}

      return (
        <div id="hotspotActivitySection">
          <input type="checkbox" id="limitHotspotsByObservationRecency" />
          <label htmlFor="limitHotspotsByObservationRecency">
            <FormattedMessage
              message={this.getIntlMessage('limitToLocations')}
              days={this.props.observationRecency} />
          </label>
          <ol className="rangeTip">
            <li className="rangeTipLeft">1</li>
            <li><input type="range" id="hotspotActivity" min="1" max="30" value={this.props.observationRecency} /></li>
            <li className="rangeTipRight">30</li>
          </ol>
        </div>
      )
    }
    return null;
  }


  render () {
    const { formatMessage, formatHTMLMessage } = this.props.intl;

    return (
      <div id="search-panel">
        <input type="text" id="location" placeholder={formatMessage({ id: 'pleaseEnterLocationSearchDefault' })} />

        <ul>
          <li className="selected">
            <input type="radio" name="resultType" id="rt1" value="all" />
            <label htmlFor="rt1"><FormattedMessage id="birdSightings" /></label>
          </li>
          <li>
            <input type="radio" name="resultType" id="rt2" value="notable" />
            <label htmlFor="rt2"><FormattedMessage id="notableSightings" /></label>
          </li>
          <li>
            <input type="radio" name="resultType" id="rt3" value="hotspots" />
            <label htmlFor="rt3"><FormattedMessage id="popularBirdingLocations" /></label>
          </li>
        </ul>

        {this.getRangeField()}

        <div>
          <input type="submit" className="btn btn-success" value={formatHTMLMessage({ id: 'searchRightArrow'})} />
          <span id="loadingSpinner" />
        </div>
      </div>
    );
  }
}

SearchPanel.propTypes = {
  location: React.PropTypes.string.isRequired,
  searchType: React.PropTypes.string.isRequired,
  observationRecency: React.PropTypes.number.isRequired,
  intl: intlShape.isRequired
};

export default injectIntl(SearchPanel);
