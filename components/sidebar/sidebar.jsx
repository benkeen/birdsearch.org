import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { VelocityComponent } from 'velocity-react';
import SearchPanel from '../search-panel/search-panel';
import { C, E } from '../../core/core';


class Sidebar extends React.Component {
  render () {
    return (
      <div></div>
    );
  }
}

//<VelocityComponent animation={{ flex: this.props.visible ? '0 0 330px' : '0 0 0px' }} duration={C.TRANSITION_SPEED}>
//  <div id="sidebar" className="flex-fill">
//    <SearchPanel
//      location={this.props.location}
//      searchType={this.props.searchType}
//      observationRecency={this.props.observationRecency} />
//  </div>
//</VelocityComponent>
//

Sidebar.PropTypes = {
  visible: React.PropTypes.bool.isRequired
};


export default connect(state => ({
  location: state.location,
  searchType: state.searchType,
  observationRecency: state.observationRecency
}))(Sidebar)
