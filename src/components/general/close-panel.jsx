import React, { Component } from 'react';
import PropTypes from 'prop-types';


export default class ClosePanel extends Component {
  constructor (props) {
    super(props);
    this.onClose = this.onClose.bind(this);
  }

  onClose (e) {
    const { onClose, disabled } = this.props;
    if (disabled) {
      return;
    }
    onClose(e);
  }

  render () {
    return (
      <span className="close-panel glyphicon glyphicon-remove-circle" onClick={this.onClose} />
    );
  }
}
ClosePanel.propTypes = {
  onClose: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};
ClosePanel.defaultTypes = {
  disabled: false
};
