import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { _ } from '../../core/core';


// generic overlay component. Provides a styled overlay wrapper (white, rounded corners with padding), plus
// a few handy things like keycode actions - ESC to close, custom keycode actions
class Overlay extends React.Component {
  componentDidMount () {
    const { id, onClose, customKeyActions } = this.props;
    $(document).on('keydown.' + id, (e) => {
      if (e.keyCode === 27) {
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
  render () {
    return (
      <StyledLoader className="loader">
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
      </StyledLoader>
    );
  }
}

Loader.PropTypes = {
  label: PropTypes.string.isRequired
};

const StyledLoader = styled.div`
.cssload-loader {
  position: absolute;
  left: 50%;
  width: 47.284271247462px;
  height: 47.284271247462px;
  margin-left: -23.142135623731px;
  margin-top: -23.142135623731px;
  border-radius: 100%;
  animation-name: cssload-loader;
  -o-animation-name: cssload-loader;
  -ms-animation-name: cssload-loader;
  -webkit-animation-name: cssload-loader;
  -moz-animation-name: cssload-loader;
  animation-iteration-count: infinite;
  -o-animation-iteration-count: infinite;
  -ms-animation-iteration-count: infinite;
  -webkit-animation-iteration-count: infinite;
  -moz-animation-iteration-count: infinite;
  animation-timing-function: linear;
  -o-animation-timing-function: linear;
  -ms-animation-timing-function: linear;
  -webkit-animation-timing-function: linear;
  -moz-animation-timing-function: linear;
  animation-duration: 6.4s;
  -o-animation-duration: 6.4s;
  -ms-animation-duration: 6.4s;
  -webkit-animation-duration: 6.4s;
  -moz-animation-duration: 6.4s;
}
.cssload-loader .cssload-side {
  display: block;
  width: 6px;
  height: 19px;
  background-color: rgba(33,117,181,0.97); // 2175B5
  margin: 2px;
  position: absolute;
  border-radius: 50%;
  animation-duration: 2.4s;
  -o-animation-duration: 2.4s;
  -ms-animation-duration: 2.4s;
  -webkit-animation-duration: 2.4s;
  -moz-animation-duration: 2.4s;
  animation-iteration-count: infinite;
  -o-animation-iteration-count: infinite;
  -ms-animation-iteration-count: infinite;
  -webkit-animation-iteration-count: infinite;
  -moz-animation-iteration-count: infinite;
  animation-timing-function: ease;
  -o-animation-timing-function: ease;
  -ms-animation-timing-function: ease;
  -webkit-animation-timing-function: ease;
  -moz-animation-timing-function: ease;
}
.cssload-loader .cssload-side:nth-child(1),
.cssload-loader .cssload-side:nth-child(5) {
  transform: rotate(0deg);
  -o-transform: rotate(0deg);
  -ms-transform: rotate(0deg);
  -webkit-transform: rotate(0deg);
  -moz-transform: rotate(0deg);
  animation-name: cssload-rotate0;
  -o-animation-name: cssload-rotate0;
  -ms-animation-name: cssload-rotate0;
  -webkit-animation-name: cssload-rotate0;
  -moz-animation-name: cssload-rotate0;
}
.cssload-loader .cssload-side:nth-child(3),
.cssload-loader .cssload-side:nth-child(7) {
  transform: rotate(90deg);
  -o-transform: rotate(90deg);
  -ms-transform: rotate(90deg);
  -webkit-transform: rotate(90deg);
  -moz-transform: rotate(90deg);
  animation-name: cssload-rotate90;
  -o-animation-name: cssload-rotate90;
  -ms-animation-name: cssload-rotate90;
  -webkit-animation-name: cssload-rotate90;
  -moz-animation-name: cssload-rotate90;
}
.cssload-loader .cssload-side:nth-child(2),
.cssload-loader .cssload-side:nth-child(6) {
  transform: rotate(45deg);
  -o-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  animation-name: cssload-rotate45;
  -o-animation-name: cssload-rotate45;
  -ms-animation-name: cssload-rotate45;
  -webkit-animation-name: cssload-rotate45;
  -moz-animation-name: cssload-rotate45;
}
.cssload-loader .cssload-side:nth-child(4),
.cssload-loader .cssload-side:nth-child(8) {
  transform: rotate(135deg);
  -o-transform: rotate(135deg);
  -ms-transform: rotate(135deg);
  -webkit-transform: rotate(135deg);
  -moz-transform: rotate(135deg);
  animation-name: cssload-rotate135;
  -o-animation-name: cssload-rotate135;
  -ms-animation-name: cssload-rotate135;
  -webkit-animation-name: cssload-rotate135;
  -moz-animation-name: cssload-rotate135;
}
.cssload-loader .cssload-side:nth-child(1) {
  top: 23.142135623731px;
  left: 47.284271247462px;
  margin-left: -3px;
  margin-top: -10px;
  animation-delay: 0;
  -o-animation-delay: 0;
  -ms-animation-delay: 0;
  -webkit-animation-delay: 0;
  -moz-animation-delay: 0;
}
.cssload-loader .cssload-side:nth-child(2) {
  top: 40.213203431093px;
  left: 40.213203431093px;
  margin-left: -3px;
  margin-top: -10px;
  animation-delay: 0;
  -o-animation-delay: 0;
  -ms-animation-delay: 0;
  -webkit-animation-delay: 0;
  -moz-animation-delay: 0;
}
.cssload-loader .cssload-side:nth-child(3) {
  top: 47.284271247462px;
  left: 23.142135623731px;
  margin-left: -3px;
  margin-top: -10px;
  animation-delay: 0;
  -o-animation-delay: 0;
  -ms-animation-delay: 0;
  -webkit-animation-delay: 0;
  -moz-animation-delay: 0;
}
.cssload-loader .cssload-side:nth-child(4) {
  top: 40.213203431093px;
  left: 7.0710678163691px;
  margin-left: -3px;
  margin-top: -10px;
  animation-delay: 0;
  -o-animation-delay: 0;
  -ms-animation-delay: 0;
  -webkit-animation-delay: 0;
  -moz-animation-delay: 0;
}
.cssload-loader .cssload-side:nth-child(5) {
  top: 23.142135623731px;
  left: 0px;
  margin-left: -3px;
  margin-top: -10px;
  animation-delay: 0;
  -o-animation-delay: 0;
  -ms-animation-delay: 0;
  -webkit-animation-delay: 0;
  -moz-animation-delay: 0;
}
.cssload-loader .cssload-side:nth-child(6) {
  top: 7.0710678163691px;
  left: 7.0710678163691px;
  margin-left: -3px;
  margin-top: -10px;
  animation-delay: 0;
  -o-animation-delay: 0;
  -ms-animation-delay: 0;
  -webkit-animation-delay: 0;
  -moz-animation-delay: 0;
}
.cssload-loader .cssload-side:nth-child(7) {
  top: 0px;
  left: 23.142135623731px;
  margin-left: -3px;
  margin-top: -10px;
  animation-delay: 0;
  -o-animation-delay: 0;
  -ms-animation-delay: 0;
  -webkit-animation-delay: 0;
  -moz-animation-delay: 0;
}
.cssload-loader .cssload-side:nth-child(8) {
  top: 7.0710678163691px;
  left: 40.213203431093px;
  margin-left: -3px;
  margin-top: -10px;
  animation-delay: 0;
  -o-animation-delay: 0;
  -ms-animation-delay: 0;
  -webkit-animation-delay: 0;
  -moz-animation-delay: 0;
}

@keyframes cssload-rotate0 {
  0% {
    transform: rotate(0deg);
  }
  60% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(180deg);
  }
}

@-o-keyframes cssload-rotate0 {
  0% {
    -o-transform: rotate(0deg);
  }
  60% {
    -o-transform: rotate(180deg);
  }
  100% {
    -o-transform: rotate(180deg);
  }
}

@-ms-keyframes cssload-rotate0 {
  0% {
    -ms-transform: rotate(0deg);
  }
  60% {
    -ms-transform: rotate(180deg);
  }
  100% {
    -ms-transform: rotate(180deg);
  }
}

@-webkit-keyframes cssload-rotate0 {
  0% {
    -webkit-transform: rotate(0deg);
  }
  60% {
    -webkit-transform: rotate(180deg);
  }
  100% {
    -webkit-transform: rotate(180deg);
  }
}

@-moz-keyframes cssload-rotate0 {
  0% {
    -moz-transform: rotate(0deg);
  }
  60% {
    -moz-transform: rotate(180deg);
  }
  100% {
    -moz-transform: rotate(180deg);
  }
}

@keyframes cssload-rotate90 {
  0% {
    transform: rotate(90deg);
    transform: rotate(90deg);
  }
  60% {
    transform: rotate(270deg);
    transform: rotate(270deg);
  }
  100% {
    transform: rotate(270deg);
    transform: rotate(270deg);
  }
}

@-o-keyframes cssload-rotate90 {
  0% {
    -o-transform: rotate(90deg);
    transform: rotate(90deg);
  }
  60% {
    -o-transform: rotate(270deg);
    transform: rotate(270deg);
  }
  100% {
    -o-transform: rotate(270deg);
    transform: rotate(270deg);
  }
}

@-ms-keyframes cssload-rotate90 {
  0% {
    -ms-transform: rotate(90deg);
    transform: rotate(90deg);
  }
  60% {
    -ms-transform: rotate(270deg);
    transform: rotate(270deg);
  }
  100% {
    -ms-transform: rotate(270deg);
    transform: rotate(270deg);
  }
}

@-webkit-keyframes cssload-rotate90 {
  0% {
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
  }
  60% {
    -webkit-transform: rotate(270deg);
    transform: rotate(270deg);
  }
  100% {
    -webkit-transform: rotate(270deg);
    transform: rotate(270deg);
  }
}

@-moz-keyframes cssload-rotate90 {
  0% {
    -moz-transform: rotate(90deg);
    transform: rotate(90deg);
  }
  60% {
    -moz-transform: rotate(270deg);
    transform: rotate(270deg);
  }
  100% {
    -moz-transform: rotate(270deg);
    transform: rotate(270deg);
  }
}

@keyframes cssload-rotate45 {
  0% {
    transform: rotate(45deg);
    transform: rotate(45deg);
  }
  60% {
    transform: rotate(225deg);
    transform: rotate(225deg);
  }
  100% {
    transform: rotate(225deg);
    transform: rotate(225deg);
  }
}

@-o-keyframes cssload-rotate45 {
  0% {
    -o-transform: rotate(45deg);
    transform: rotate(45deg);
  }
  60% {
    -o-transform: rotate(225deg);
    transform: rotate(225deg);
  }
  100% {
    -o-transform: rotate(225deg);
    transform: rotate(225deg);
  }
}

@-ms-keyframes cssload-rotate45 {
  0% {
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }
  60% {
    -ms-transform: rotate(225deg);
    transform: rotate(225deg);
  }
  100% {
    -ms-transform: rotate(225deg);
    transform: rotate(225deg);
  }
}

@-webkit-keyframes cssload-rotate45 {
  0% {
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
  }
  60% {
    -webkit-transform: rotate(225deg);
    transform: rotate(225deg);
  }
  100% {
    -webkit-transform: rotate(225deg);
    transform: rotate(225deg);
  }
}

@-moz-keyframes cssload-rotate45 {
  0% {
    -moz-transform: rotate(45deg);
    transform: rotate(45deg);
  }
  60% {
    -moz-transform: rotate(225deg);
    transform: rotate(225deg);
  }
  100% {
    -moz-transform: rotate(225deg);
    transform: rotate(225deg);
  }
}

@keyframes cssload-rotate135 {
  0% {
    transform: rotate(135deg);
    transform: rotate(135deg);
  }
  60% {
    transform: rotate(315deg);
    transform: rotate(315deg);
  }
  100% {
    transform: rotate(315deg);
    transform: rotate(315deg);
  }
}

@-o-keyframes cssload-rotate135 {
  0% {
    -o-transform: rotate(135deg);
    transform: rotate(135deg);
  }
  60% {
    -o-transform: rotate(315deg);
    transform: rotate(315deg);
  }
  100% {
    -o-transform: rotate(315deg);
    transform: rotate(315deg);
  }
}

@-ms-keyframes cssload-rotate135 {
  0% {
    -ms-transform: rotate(135deg);
    transform: rotate(135deg);
  }
  60% {
    -ms-transform: rotate(315deg);
    transform: rotate(315deg);
  }
  100% {
    -ms-transform: rotate(315deg);
    transform: rotate(315deg);
  }
}

@-webkit-keyframes cssload-rotate135 {
  0% {
    -webkit-transform: rotate(135deg);
    transform: rotate(135deg);
  }
  60% {
    -webkit-transform: rotate(315deg);
    transform: rotate(315deg);
  }
  100% {
    -webkit-transform: rotate(315deg);
    transform: rotate(315deg);
  }
}

@-moz-keyframes cssload-rotate135 {
  0% {
    -moz-transform: rotate(135deg);
    transform: rotate(135deg);
  }
  60% {
    -moz-transform: rotate(315deg);
    transform: rotate(315deg);
  }
  100% {
    -moz-transform: rotate(315deg);
    transform: rotate(315deg);
  }
}

@keyframes cssload-loader {
  0% {
    transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@-o-keyframes cssload-loader {
  0% {
    -o-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -o-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@-ms-keyframes cssload-loader {
  0% {
    -ms-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -ms-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@-webkit-keyframes cssload-loader {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@-moz-keyframes cssload-loader {
  0% {
    -moz-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -moz-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}


$line-loader-width: 30px;
$line-loader-circle-size: 6px;
$line-loader-colour: #777777;
$line-loader-speed: 0.6;

.line-loader {
  width: $line-loader-width;
  text-align: center;
}

.line-loader > div {
  width: $line-loader-circle-size;
  height: $line-loader-circle-size;
  background-color: $line-loader-colour;
  border-radius: 100%;
  display: inline-block;
  -webkit-animation: sk-bouncedelay 1.2s infinite ease-in-out both;
  animation: sk-bouncedelay 1.2s infinite ease-in-out both;
  margin-right: 2px;
}

.line-loader .bounce1 {
  -webkit-animation-delay: -0.2s;
  animation-delay: -0.2s;
}

.line-loader .bounce2 {
  -webkit-animation-delay: -0.1s;
  animation-delay: -0.1s;
}

@-webkit-keyframes sk-bouncedelay {
  0%, 80%, 100% { -webkit-transform: scale(0) }
  40% { -webkit-transform: scale(1.0) }
}

@keyframes sk-bouncedelay {
  0%, 80%, 100% {
    -webkit-transform: scale(0);
    transform: scale(0);
  } 40% {
      -webkit-transform: scale(1.0);
      transform: scale(1.0);
    }
}


#data-loader {
  top: 60px;
  height: 80px;
  width: 80px;
  background-color: white;
  border-radius: 6px;
  padding-top: 40px;
}
`;

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
