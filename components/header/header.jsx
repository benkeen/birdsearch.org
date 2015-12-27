import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import * as actions from './actions';


class Header extends React.Component {
  render () {
    const { dispatch, locale } = this.props;

    return (
      <header className="flex-fill">
        <div className="navbar">
          <h1 className="brand">birdsearch.org</h1>
        </div>

        <HeaderSearch disabled={true} />

        <ul className="nav-items">
          <li>
            <Link to="/account"><FormattedMessage id="login" /></Link>
          </li>
          <li>
            <Link to="/about"><FormattedMessage id="about" /></Link>
          </li>
          <li className="lang-toggle">
            <LanguageToggle
              locale={locale}
              onChange={locale => dispatch(actions.setLocale(locale))} />
          </li>
        </ul>

      </header>
    );
  }
}

export default connect(state => ({ locale: state.locale }))(Header)


class HeaderSearch extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    var searchBtnClasses = 'btn' + (!this.props.disabled ? ' btn-success' : '');

    return (
      <div className="header-search">
        <input type="text" placeholder="Enter Location" />
        <button className={searchBtnClasses}>Search</button>
        <Link className="advanced-search-link" to="/advanced-search">advanced search</Link>
      </div>
    );
  }
}
HeaderSearch.PropTypes = {
  disabled: React.PropTypes.bool.isRequired
};


class LanguageToggle extends React.Component {
  onChange (e) {
    e.preventDefault();
    this.props.onChange(e.target.value);
  }

  render () {
    return (
      <select id="select-locale" value={this.props.locale} onChange={e => this.onChange(e)}>
        <option value="en">English</option>
        <option value="fr">Français</option>
        <option value="de">Deutsch</option>
        <option value="es">Español</option>
      </select>
    );
  }
}

LanguageToggle.propTypes = {
  locale: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired
};

