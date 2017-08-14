import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Link } from 'react-router';
import { actions } from '../../core/core';
import { Tooltip } from 'react-bootstrap';
import { ClosePanel } from './general';


class SearchTip extends React.Component {
  constructor (props) {
    super(props);

    // ALWAYS hidden when this component
    this.state = {
      visible: false
    };
    this.close = this.close.bind(this);
  }

  componentDidMount () {
    const { dispatch, searchTooltipHidden } = this.props;

    // any time this component mounts, show the tooltip after a half a second, assuming it hasn't been explicitly closed
    if (!searchTooltipHidden) {
      setTimeout(() => { this.setState({ visible: true }); }, 500);
    }
    dispatch(actions.searchAnywhere());
  }

  componentWillUpdate (nextProps) {
    const { visible } = this.state;
    if (visible && nextProps.searchTooltipHidden) {
      this.setState({ visible: false });
    }
  }

  componentWillUnmount () {
    const { dispatch } = this.props;

    // clear the tooltip visibility in case the user returns to the /search URL again
    dispatch(actions.clearSearchTooltipVisibility());
  }

  // if the user closes the tooltip explicitly, we don't show it again for the rest of the users session
  close () {
    const { dispatch } = this.props;
    dispatch(actions.hideSearchTooltip(true));
  }

  getTooltip () {
    const { obsRecency } = this.props;
    const classes = 'bounce' + ((!this.state.visible) ? ' is-hidden' : '');

    return (
      <Tooltip id="intro-tooltip" className={classes}>
        <ClosePanel onClose={this.close} />
        <FormattedMessage id="searchTip"
          values={{
            days: <Link to="/settings"><FormattedMessage id="searchTipDays" values={{ obsRecency: obsRecency }} /></Link>
          }} />
      </Tooltip>
    );
  }

  render () {
    return (
      <div>
        <div id="map-overlay" className="editable-header"></div>
        {this.getTooltip()}
      </div>
    );
  }
}

export default injectIntl(connect(state => ({
  obsRecency: state.settingsOverlay.observationRecency,
  searchTooltipHidden: state.misc.searchTooltipHidden
}))(SearchTip));

