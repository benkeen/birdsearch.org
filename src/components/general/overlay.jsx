import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClosePanel from './close-panel';


/**
 * Generic overlay component. Provides a styled overlay wrapper (white, rounded corners with padding), plus
 * a few handy things like keycode actions - ESC to close, custom keycode actions.
 */
export default class Overlay extends Component {
  componentDidMount () {
    const { id, onClose, customKeyActions } = this.props;
    $(document).on('keydown.' + id, (e) => {
      if (e.keyCode === 27) {
        onClose();
        return;
      }
      customKeyActions.forEach(([keyCode, action]) => {
        if (e.keyCode === parseInt(keyCode, 10)) {
          e.preventDefault();
          action();
        }
      });
    });
  }

  componentWillUnmount () {
    const { id } = this.props;
    $(document).off('keydown.' + id);
  }

  getCloseIcon () {
    const { onClose, showCloseIcon } = this.props;
    if (!showCloseIcon) {
      return false;
    }
    return (
      <ClosePanel onClose={onClose} />
    );
  }

  render () {
    const { children, id, className, outerHTML } = this.props;
    const classes = 'overlay' + ((className) ? ' ' + className : '');

    return (
    <div className="tab-wrapper">
      <div id="map-overlay"></div>
      <div id={id} className={classes}>
        {outerHTML}
        <div className="tab-content">
          {this.getCloseIcon()}
          {children}
        </div>
      </div>
    </div>
    );
  }
}
Overlay.propTypes = {
  id: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  showCloseIcon: PropTypes.bool,
  closeIconDisabled: PropTypes.bool,
  className: PropTypes.string,
  customKeyActions: PropTypes.array
};
Overlay.defaultProps = {
  showCloseIcon: false,
  closeIconDisabled: false,
  className: '',
  outerHTML: '',
  customKeyActions: []
};
