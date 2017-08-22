import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';


const rotate0 = keyframes`
  0% {
    transform: rotate(0deg);
  }
  60% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(180deg);
  }
`;

const rotate90 = keyframes`
  0% {
    transform: rotate(90deg);
  }
  60% {
    transform: rotate(270deg);
  }
  100% {
    transform: rotate(270deg);
  }
`;

const rotate45 = keyframes`
  0% {
    transform: rotate(45deg);
  }
  60% {
    transform: rotate(225deg);
  }
  100% {
    transform: rotate(225deg);
  }
`;

const rotate135 = keyframes`
  0% {
    transform: rotate(135deg);
  }
  60% {
    transform: rotate(315deg);
  }
  100% {
    transform: rotate(315deg);
  }
`;

const StyledLoader = styled.div`
  position: absolute;
  left: 50%;
  width: 47.284271247462px;
  height: 47.284271247462px;
  margin-left: -23.142135623731px;
  margin-top: -23.142135623731px;
  border-radius: 100%;
  animation-name: cssload-loader;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  animation-duration: 6.4s;

  .cssload-side {
    display: block;
    width: 6px;
    height: 19px;
    background-color: rgba(33,117,181,0.97); // 2175B5
    margin: 2px;
    position: absolute;
    border-radius: 50%;
    animation-duration: 2.4s;
    animation-iteration-count: infinite;
    animation-timing-function: ease;
  }
  .cssload-side:nth-child(1),
  .cssload-side:nth-child(5) {
    transform: rotate(0deg);
    animation-name: ${rotate0};
  }
  .cssload-side:nth-child(3),
  .cssload-side:nth-child(7) {
    transform: rotate(90deg);
    animation-name: ${rotate90};
  }
  .cssload-side:nth-child(2),
  .cssload-side:nth-child(6) {
    transform: rotate(45deg);
    animation-name: ${rotate45};
  }
  .cssload-side:nth-child(4),
  .cssload-side:nth-child(8) {
    transform: rotate(135deg);
    animation-name: ${rotate135};
  }
  .cssload-side:nth-child(1) {
    top: 23.142135623731px;
    left: 47.284271247462px;
    margin-left: -3px;
    margin-top: -10px;
    animation-delay: 0;
  }
  .cssload-side:nth-child(2) {
    top: 40.213203431093px;
    left: 40.213203431093px;
    margin-left: -3px;
    margin-top: -10px;
    animation-delay: 0;
  }
  .cssload-side:nth-child(3) {
    top: 47.284271247462px;
    left: 23.142135623731px;
    margin-left: -3px;
    margin-top: -10px;
    animation-delay: 0;
  }
  .cssload-side:nth-child(4) {
    top: 40.213203431093px;
    left: 7.0710678163691px;
    margin-left: -3px;
    margin-top: -10px;
    animation-delay: 0;
  }
  .cssload-side:nth-child(5) {
    top: 23.142135623731px;
    left: 0px;
    margin-left: -3px;
    margin-top: -10px;
    animation-delay: 0;
  }
  .cssload-side:nth-child(6) {
    top: 7.0710678163691px;
    left: 7.0710678163691px;
    margin-left: -3px;
    margin-top: -10px;
    animation-delay: 0;
  }
  .cssload-side:nth-child(7) {
    top: 0px;
    left: 23.142135623731px;
    margin-left: -3px;
    margin-top: -10px;
    animation-delay: 0;
  }
  .cssload-side:nth-child(8) {
    top: 7.0710678163691px;
    left: 40.213203431093px;
    margin-left: -3px;
    margin-top: -10px;
    animation-delay: 0;
  }
`;


export default class CircleLoader extends Component {
  render () {
    return (
      <StyledLoader>
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

CircleLoader.PropTypes = {
  label: PropTypes.string.isRequired
};
