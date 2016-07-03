import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import { Loader, ClosePanel } from './general';
import { C, _, actions } from '../core/core';


class IntroOverlay extends React.Component {
  constructor (props) {
    super(props);
    this.searchNearby = this.searchNearby.bind(this);
    this.searchAnywhere = this.searchAnywhere.bind(this);
  }

  // TODO URGH. Try again to solve this better.
  componentDidUpdate (prevProps) {
    const { dispatch, searchSettings, mapSettings } = this.props;
    if (prevProps.userLocationFound !== this.props.userLocationFound && this.props.userLocationFound === true) {
      dispatch(actions.search(searchSettings, mapSettings));
    }
  }

  componentDidMount () {
    // if the browser doesn't support geolocation, disable the option but don't hide it. Rub it in that they're using
    // an old crap browser.
    //navigator.geolocation) { }
  }

  getLoader () {
    /// hmm https://github.com/yahoo/react-intl/wiki/API#formatmessage
    return (this.props.loading) ? (<Loader label="FINDING YOUR LOCATION..." />) : null;
  }

  searchNearby () {
    const { dispatch } = this.props;
    dispatch(actions.getGeoLocation());
  }

  searchAnywhere () {
    const { dispatch } = this.props;
    dispatch(actions.searchAnywhere());
    dispatch(actions.setIntroOverlayVisibility(false));
  }

  close () {
    browserHistory.push('/app');
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
              <ClosePanel onClose={this.close} />

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
  loading: React.PropTypes.bool.isRequired
};

export default connect(state => ({
  loading: state.user.isFetching,
  userLocationFound: state.user.userLocationFound,
  searchSettings: state.searchSettings,
  mapSettings: state.mapSettings
}))(IntroOverlay);

