import React from 'react';


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
  label: React.PropTypes.string
};
Loader.defaultProps = {
  label: 'Loading...'
};


class ClosePanel extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    return (
      <span className="close-panel glyphicon glyphicon-remove-circle" onClick={this.props.onClose}></span>
    );
  }
}
ClosePanel.PropTypes = {
  onClose: React.PropTypes.func.isRequired
};


export {
  Loader,
  ClosePanel
};
