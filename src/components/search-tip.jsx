import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, FormattedPlural, intlShape, injectIntl } from 'react-intl';
import { browserHistory } from 'react-router';
import { Link } from 'react-router';
import { C, _, actions } from '../core/core';
import { VelocityTransitionGroup } from 'velocity-react';
import { OverlayTrigger, Tooltip, Popover } from 'react-bootstrap';
import { ClosePanel } from './general';


class SearchTip extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  componentDidMount () {
    setTimeout(() => {
      this.setState({ visible: true });
    }, 500);
  }

  close () {
    browserHistory.push('/');
  }

  getTooltip () {
    const { obsRecency } = this.props;

    if (!this.state.visible) {
      return null;
    }

    return (
      <Tooltip id="intro-tooltip" className="bounce">
        <ClosePanel onClose={this.close} />
        <FormattedMessage id="searchTip"
          values={{
            days: (
              <Link to="/settings">
                <b>{obsRecency}</b>
                <FormattedPlural
                  value={obsRecency}
                  one=" day"
                  other=" days" />
              </Link>
              )
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
  obsRecency: state.settingsOverlay.observationRecency
}))(SearchTip));

