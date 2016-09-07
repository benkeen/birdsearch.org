import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { browserHistory } from 'react-router';
import { Loader, ClosePanel } from './general';
import { C, _, actions } from '../core/core';


class IntroOverlay extends React.Component {
  constructor (props) {
    super(props);
    this.close = this.close.bind(this);
    this.searchNearby = this.searchNearby.bind(this);
    this.searchAnywhere = this.searchAnywhere.bind(this);
  }

  componentDidUpdate (prevProps) {
    const { dispatch, searchSettings, mapSettings } = this.props;

    // if the user's location was just found automatically search
    if (prevProps.userLocationFound !== this.props.userLocationFound && this.props.userLocationFound === true) {
      dispatch(actions.search(searchSettings.location, searchSettings.lat, searchSettings.lng, mapSettings.bounds,
        searchSettings.limitByObservationRecency, searchSettings.observationRecency));
    }
  }

  componentDidMount () {
    // if the browser doesn't support geolocation, disable the option but don't hide it. Rub it in that they're using
    // an old crap browser.
    //navigator.geolocation) { }
  }

  getLoader () {
    const { intl, loading } = this.props;
    return (loading) ? (<Loader label={intl.formatMessage({ id: 'findingYourLocation' }).toUpperCase()} />) : null;
  }

  searchNearby () {
    const { dispatch } = this.props;
    dispatch(actions.getGeoLocation());
  }

  searchAnywhere () {
    const { dispatch } = this.props;
    dispatch(actions.searchAnywhere());
    dispatch(actions.setIntroOverlayVisibility(false));
    browserHistory.push('/');
  }

  close () {
    const { dispatch } = this.props;
    dispatch(actions.setIntroOverlayVisibility(false));
    browserHistory.push('/');
  }

  render () {
    const { loading } = this.props;
    const classes = 'overlay' + ((loading) ? ' loading' : '');

    return (
      <div>
        <div id="map-overlay"></div>
        <div id="intro-overlay" className={classes}>
          <div className="tab-wrapper">
            {this.getLoader()}

            <div className="tab-content">
              <ClosePanel onClose={this.close} disabled={loading} />

              <div>
                <button className="btn btn-success" id="searchNearby" onClick={this.searchNearby} disabled={loading}>
                  <i className="glyphicon glyphicon-home" />
                  <FormattedMessage id="searchNearby" />
                </button>
                <FormattedMessage id="findInArea" />
              </div>

              <p className="or"><FormattedMessage id="or" /></p>

              <div>
                <button className="btn btn-info" id="searchAnywhere" onClick={this.searchAnywhere} disabled={loading}>
                  <i className="glyphicon glyphicon-globe" />
                  <FormattedMessage id="searchAnywhere" />
                </button>
                <FormattedMessage id="findAnywhere" />
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }
}
IntroOverlay.PropTypes = {
  loading: React.PropTypes.bool.isRequired,
  intl: intlShape.isRequired
};

export default injectIntl(connect(state => ({
  loading: state.user.isFetching,
  userLocationFound: state.user.userLocationFound,
  searchSettings: state.searchSettings,
  mapSettings: state.mapSettings
}))(IntroOverlay));

