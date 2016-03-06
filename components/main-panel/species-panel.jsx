import React from 'react';
import ReactDOM from 'react-dom';
import { VelocityComponent } from 'velocity-react';
import { C, E, _, actions } from '../../core/core';
import { Loader, ClosePanel } from '../general/general';



export class SpeciesPanel extends React.Component {
  componentDidMount () {
    $(ReactDOM.findDOMNode(this.refs.panel)).css({ display: 'none' });
  }

  transitionBegin () {
    if (this.props.visible) {
      $(ReactDOM.findDOMNode(this.refs.panel)).css({ display: 'block' });
    }
  }

  transitionComplete () {
    if (!this.props.visible) {
      $(ReactDOM.findDOMNode(this.refs.panel)).css({ display: 'none' });
    }
  }

  render () {
    const { dispatch, visible, env } = this.props;

    var panelPosition = {
      width: env.windowWidth - C.PANEL_DIMENSIONS.LEFT_PANEL_WIDTH
    };

    return (
      <section id="species-panel" style={panelPosition}>
        <header className="section-header" onClick={() => dispatch(actions.togglePanelVisibility(C.PANELS.SPECIES))}>
          <div>
            <h2>Bird species <span className="total-count num-locations">0</span></h2>
            <span className="toggle-section glyphicon glyphicon-menu-hamburger" />
          </div>
        </header>
        <VelocityComponent animation={{ opacity: visible ? 1 : 0 }} duration={C.TRANSITION_SPEED}
          complete={this.transitionComplete.bind(this)} begin={this.transitionBegin.bind(this)}>
          <div className="panel" ref="panel">
            <ClosePanel onClose={() => dispatch(actions.togglePanelVisibility(C.PANELS.SPECIES))} />
          </div>
        </VelocityComponent>
      </section>
    );
  }
}
SpeciesPanel.PropTypes = {
  visible: React.PropTypes.bool.isRequired,
  env: React.PropTypes.object.isRequired
};
