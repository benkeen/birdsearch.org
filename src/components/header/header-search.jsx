import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { VelocityTransitionGroup } from 'velocity-react';
import { intlShape } from 'react-intl';
import { C, helpers } from '../../core/core';


class HeaderSearch extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      showError: false,
      error: ''
    };
  }

  componentDidMount () {
    const { onSubmit, intl, setLocation } = this.props;

    let autoComplete = new google.maps.places.Autocomplete(ReactDOM.findDOMNode(this.refs.searchField));
    let selectedLocation;
    google.maps.event.addListener(autoComplete, 'place_changed', () => {
      let currPlace = autoComplete.getPlace();
      if (!currPlace.geometry) {
        return;
      }

      if (!currPlace.geometry.viewport || !currPlace.geometry.location) {
        setLocation(selectedLocation);
        this.setState({ showError: true, error: intl.formatMessage({ id: 'locationNotFound' }) });
        return;
      }

      if (currPlace.address_components.length < 3) {
        setLocation(selectedLocation);
        this.setState({ showError: true, error: intl.formatMessage({ id: 'pleaseEnterSpecificLocation' }) });
        return;
      }

      onSubmit({
        lat: currPlace.geometry.location.lat(),
        lng: currPlace.geometry.location.lng(),
        location: selectedLocation,
        bounds: helpers.getBestBounds(currPlace.geometry.viewport, currPlace.geometry.bounds)
      });
    });

    // hack workaround to get the exact location string that the user selected so we can pass it to React
    $(ReactDOM.findDOMNode(this.refs.searchField)).on('keyup', (e) => {
      if (e.keyCode === 13) {
        selectedLocation = e.target.value;
      }
    });
  }

  componentWillUpdate (nextProps, nextState) {
    if (nextState.showError && !this.state.showError) {
      setTimeout(() => { this.hideError(); }, C.ERROR_VISIBILITY_TIME);
    }
  }

  componentWillReceiveProps (nextProps) {
    const { intl, searchError } = this.props;

    // if an error is being fed in from a parent, only display it once. This relies on the reducer code resetting
    // the error to blank before setting it to a value again. Again, React handles one-offs like this very poorly.
    if (!searchError && nextProps.searchError) {
      this.setState({
        showError: true,
        error: intl.formatMessage({ id: nextProps.searchError }) });
    }
  }

  hideError () {
    this.setState({
      showError: false
    });
  }

  focus () {
    ReactDOM.findDOMNode(this.refs.searchField).focus();
  }

  onChangeLocation (e) {
    e.preventDefault();
    this.props.onChange(e.target.value);
  }

  render () {
    const { intl } = this.props;

    return (
    <div className="header-search">
      <input type="text" className="search-input-field" placeholder={intl.formatMessage({ id: 'enterLocation' })}
             ref="searchField" value={this.props.location} onChange={this.onChangeLocation.bind(this)} />

      <div className="location-error">
        <VelocityTransitionGroup enter={{ animation: 'slideDown' }} leave={{ animation: 'slideUp' }} component="div">
          {this.state.showError ? <div>{this.state.error}</div> : undefined}
        </VelocityTransitionGroup>
      </div>
    </div>
    );
  }
}
HeaderSearch.PropTypes = {
  disabled: PropTypes.bool.isRequired,
  location: PropTypes.string.isRequired,
  onChangeLocation: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  setLocation: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

export default HeaderSearch;
