import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, FormattedHTMLMessage, intlShape, injectIntl } from 'react-intl';
import { browserHistory } from 'react-router';
import { Loader, Overlay } from './general';
import { C, _, actions } from '../core/core';


class IntroOverlay extends React.Component {
  constructor (props) {
    super(props);
    this.close = this.close.bind(this);
    this.searchNearby = this.searchNearby.bind(this);
    this.searchAnywhere = this.searchAnywhere.bind(this);
    this.state = {
      supportsGeoLocation: true
    };
  }

  componentDidUpdate (prevProps) {
    const { dispatch, mapSettings, userLocationFound } = this.props;
    const { location, lat, lng } = this.props.searchSettings;
    const { searchType, observationRecency, zoomHandling } = this.props.settingsOverlay;

    // if the user's location was just found, automatically search
    if (prevProps.userLocationFound !== userLocationFound && userLocationFound === true) {
      dispatch(actions.search(searchType, location, lat, lng, mapSettings.bounds, observationRecency, zoomHandling));
    }
  }

  // kludgy, but due to browser weirdnesses. If the user clicks "Search Nearby" then either denies allowing the site
  // from finding their location, or even clicks "x" to close the panel, this code disables the button for the rest
  // of their session. Kind of a pain, but the "x" button in Chrome throws the same error as when they deny access to the
  // location so we just don't know which is which. The other weird thing about this is that if they DENY access to the
  // location, refresh the page, the 
  componentWillReceiveProps ({ errorRetrievingUserLocation }) {
    if (errorRetrievingUserLocation) {
      this.setState({
        supportsGeoLocation: false
      });
    }
  }

  componentWillMount () {
    // if the browser doesn't support geolocation, disable the option but don't hide it. A message will appear
    // saying the browser doesn't support it.
    if (!navigator.geolocation) {
      this.setState({ supportsGeoLocation: false });
    }
  }

  getLoader () {
    const { intl, loading } = this.props;
    return (loading) ? (<Loader label={intl.formatMessage({ id: 'findingYourLocation' }).toUpperCase()} />) : null;
  }

  searchNearby () {
    const { dispatch } = this.props;
    dispatch(actions.getGeoLocation(this.onUserLocationFound));
  }

  onUserLocationFound () {
    browserHistory.push('/');
  }

  searchAnywhere () {
    const { dispatch } = this.props;
    dispatch(actions.searchAnywhere());
    dispatch(actions.setIntroOverlayVisibility(false));
    browserHistory.push('/search-tip');
  }

  close () {
    const { dispatch } = this.props;
    dispatch(actions.setIntroOverlayVisibility(false));
    browserHistory.push('/');
  }

  getCustomKeyActions () {
    const { intl } = this.props;
    const customKeyActions = [];

    const keyCodeNearby = intl.formatMessage({ id: 'LANG_SEARCH_NEARBY_KEYCODE'});
    if (keyCodeNearby) {
      customKeyActions.push([keyCodeNearby, this.searchNearby]);
    }
    const keyCodeAnywhere = intl.formatMessage({ id: 'LANG_SEARCH_ANYWHERE_KEYCODE'});
    if (keyCodeAnywhere) {
      customKeyActions.push([keyCodeAnywhere, this.searchAnywhere]);
    }
    return customKeyActions;
  }

  render () {
    const { loading } = this.props;
    const classes = (loading) ? 'loading' : '';

    return (
      <Overlay id="intro-overlay" className={classes} showCloseIcon={true} onClose={this.close} outerHTML={this.getLoader()}
        customKeyActions={this.getCustomKeyActions()}>
        <div>
          <button className="btn btn-success" id="searchNearby" onClick={this.searchNearby} disabled={loading || !this.state.supportsGeoLocation}>
            <i className="glyphicon glyphicon-home" />
            <FormattedHTMLMessage id="searchNearby" />
          </button>
          <FormattedMessage id="findInArea" />
        </div>

        <p className="or"><FormattedMessage id="or" /></p>

        <div>
          <button className="btn btn-primary" id="searchAnywhere" onClick={this.searchAnywhere} disabled={loading}>
            <i className="glyphicon glyphicon-globe" />
            <FormattedHTMLMessage id="searchAnywhere" />
          </button>
          <FormattedMessage id="findAnywhere" />
        </div>
      </Overlay>
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
  errorRetrievingUserLocation: state.user.errorRetrievingUserLocation,
  searchSettings: state.searchSettings,
  settingsOverlay: state.settingsOverlay,
  mapSettings: state.mapSettings
}))(IntroOverlay));

