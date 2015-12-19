import React from 'react';
import ReactDOM from 'react-dom';
import { C, E } from '../../core/core';


function setLocale (locale) {
  return {
    type: E.SET_LOCALE,
    locale
  };
}

export {
  setLocale
};
