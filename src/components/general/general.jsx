import React from 'react';
import PropTypes from 'prop-types';
import { _ } from '../../core/core';


// generic overlay component. Provides a styled overlay wrapper (white, rounded corners with padding), plus
// a few handy things like keycode actions - ESC to close, custom keycode actions
class Overlay extends React.Component {
  componentDidMount () {
    const { id, onClose, customKeyActions } = this.props;
    $(document).on('keydown.' + id, (e) => {
      if (e.keyCode == 27) {
        onClose();
        return;
      }
      _.each(customKeyActions, ([keyCode, action]) => {
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


class Loader extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    return (
      <div className="loader">
        <div className="cssload-loader">
          <div className="cssload-side"></div>
          <div className="cssload-side"></div>
          <div className="cssload-side"></div>
          <div className="cssload-side"></div>
          <div className="cssload-side"></div>
          <div className="cssload-side"></div>
          <div className="cssload-side"></div>
          <div className="cssload-side"></div>
        </div>
        <div className="loader-label">{this.props.label}</div>
      </div>
    );
  }
}

Loader.PropTypes = {
  label: PropTypes.string.isRequired
};


class ClosePanel extends React.Component {
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

class LineLoader extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    let classes = 'line-loader';
    if (this.props.className) {
      classes += ' ' + this.props.className;
    }

    return (
      <div className={classes}>
        <div className="bounce1"></div>
        <div className="bounce2"></div>
        <div className="bounce3"></div>
      </div>
    );
  }
}
LineLoader.PropTypes = {
  className: PropTypes.string
};


class LocationsDropdown extends React.Component {
  constructor (props) {
    super(props);
  }

  getLocationRows () {
    return _.map(this.props.locations, function (location) {
      return (<option value={location.i} key={location.i}>{location.n}</option>);
    });
  }

  render () {
    return (
      <select value={this.props.selected} >
        <option value="">All Locations</option>
        {this.getLocationRows()}
      </select>
    );
  }
}
LocationsDropdown.PropTypes = {
  locations: PropTypes.array.isRequired,
  selected: PropTypes.string.isRequired
};

// draws a pretty count element with the appropriate colour
class LocationCount extends React.Component {
  render () {
    const { count, classNameOverride } = this.props;

    if (count === null) {
      return (<span>...</span>);
    }

    let className = 'range ';

    if (classNameOverride) {
      className += ' ' + classNameOverride;
    } else if (count < 10) {
      className += 'range1';
    } else if (count < 20) {
      className += 'range2';
    } else if (count < 30) {
      className += 'range3';
    } else if (count < 40) {
      className += 'range4';
    } else if (count < 50) {
      className += 'range5';
    } else if (count < 60) {
      className += 'range6';
    } else if (count < 70) {
      className += 'range7';
    } else {
      className += 'range8';
    }

    return (
      <span className={className}>{count}</span>
    );
  }
}
LocationCount.PropTypes = {
  count: PropTypes.number,
  classNameOverride: PropTypes.string
};
LocationCount.defaultProps = {
  count: null,
  classNameOverride: null
};


export {
  Loader,
  Overlay,
  ClosePanel,
  LineLoader,
  LocationsDropdown,
  LocationCount
};
