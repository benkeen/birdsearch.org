import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LOCALES } from '../../i18n/index';
import { _ } from '../../core';


// displays the locale selector as either a dropdown or HTML unordered list
class LocaleSelector extends Component {
  onChange (e) {
    e.preventDefault(); // needed? We could drop this if not....
    this.updateLocale(e.target.value);
  }

  updateLocale (newLocale) {
    const { locale, onChange } = this.props;
    $('body').removeClass(locale).addClass(newLocale);
    onChange(newLocale);
  }

  getLocaleOptions () {
    return _.map(LOCALES, (locale) => {
      return (
        <option value={locale.key} key={locale.key}>{locale.name}</option>
      );
    });
  }

  getLocalePills () {
    const { locale } = this.props;
    return _.map(LOCALES, (currLocale) => {
      let className = (locale === currLocale.key) ? 'active' : '';
      return (
        <li value={currLocale.key} className={className} key={currLocale.key}
          onClick={() => this.updateLocale(currLocale.key)}>{currLocale.name}</li>
      );
    });
  }

  render () {
    const { type, locale } = this.props;
    if (type === 'dropdown') {
      return (
      <select id="select-locale" className="form-control" value={locale} onChange={(e) => this.onChange(e)}>
        {this.getLocaleOptions()}
      </select>
      );
    }

    return (
    <ul className="nav-pills">
      {this.getLocalePills()}
    </ul>
    );
  }
}

LocaleSelector.propTypes = {
  type: PropTypes.string.isRequired,
  locale: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default LocaleSelector;
