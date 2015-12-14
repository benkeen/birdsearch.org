import React from 'react';
import ReactDOM from 'react-dom';
import { C, E, store, L } from '../../core/core';

function selectLang (lang) {
  return {
    type: E.SELECT_LANG,
    lang
  };
}

export default {
  selectLang
};
