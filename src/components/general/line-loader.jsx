import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';


const bounceDelay = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  } 40% {
    transform: scale(1.0);
  }
`;

const LoaderWrapper = styled.div`
  width: 30px;
  text-align: center;

  > div {
    width: 6px;
    height: 6px;
    background-color: #777777;
    border-radius: 100%;
    display: inline-block;
    animation: ${bounceDelay} 1.2s infinite ease-in-out both;
    margin-right: 2px;
  }
  .bounce1 {
    animation-delay: -0.2s;
  }
  .bounce2 {
    animation-delay: -0.1s;
  }
`;

export default class LineLoader extends Component {
  render () {
    let classes = 'line-loader';
    if (this.props.className) {
      classes += ' ' + this.props.className;
    }

    return (
      <LoaderWrapper className={classes}>
        <div className="bounce1"></div>
        <div className="bounce2"></div>
        <div className="bounce3"></div>
      </LoaderWrapper>
    );
  }
}
LineLoader.PropTypes = {
  className: PropTypes.string
};
