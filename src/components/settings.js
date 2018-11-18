import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { browserHistory } from 'react-router';
import { Overlay } from './general';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { C, _, actions } from '../core/core';


class SettingsOverlay extends Component {
	constructor(props) {
		super(props);
		this.search = this.search.bind(this);
	}

	close() {
		browserHistory.push('/');
	}

	search() {
		const { dispatch, searchSettings, settingsOverlay, mapSettings, viewportMode } = this.props;
		const { lat, lng, location } = searchSettings;
		const { searchType, observationRecency, zoomHandling } = settingsOverlay;
		const showLocationsPanel = (viewportMode === C.VIEWPORT_MODES.DESKTOP);
		dispatch(actions.search(searchType, location, lat, lng, mapSettings.bounds, observationRecency, zoomHandling, showLocationsPanel));
		browserHistory.push('/');
	}

	getContent() {
		const { dispatch, intl, searchSettings } = this.props;
		const { selectedTab, searchType, zoomHandling, observationRecency, showScientificName, mapStyle } = this.props.settingsOverlay;

		if (selectedTab === C.SEARCH_OVERLAY_TABS.SEARCH_SETTINGS) {
			return (
			<SearchSettings
			dispatch={dispatch}
			intl={intl}
			search={this.search}
			zoomHandling={zoomHandling}
			observationRecency={observationRecency}
			location={searchSettings.location}
			searchType={searchType}
			showScientificName={showScientificName}/>
			);
		} else {
			return (
			<MapStyles
			dispatch={dispatch}
			intl={intl}
			selected={mapStyle}/>
			);
		}
	}

	selectTab(e, tab) {
		e.preventDefault();
		const { dispatch } = this.props;
		const { selectedTab } = this.props.settingsOverlay;
		if (tab === selectedTab) {
			return;
		}
		dispatch(actions.selectSettingsOverlayTab(tab));
	}

	render() {
		const { selectedTab } = this.props.settingsOverlay;
		const searchSettingsClasses = (selectedTab === C.SEARCH_OVERLAY_TABS.SEARCH_SETTINGS) ? 'active' : '';
		const mapStyleClasses = (selectedTab === C.SEARCH_OVERLAY_TABS.MAP_STYLES) ? 'active' : '';
		const classes = (this.props.searchSettings.location) ? 'with-search' : null;

		return (
		<Overlay id="settings-overlay" onClose={this.close} showCloseIcon={true} className={classes}>
			<ul className="nav nav-pills">
				<li className={searchSettingsClasses}>
					<a href="#"
					   onClick={(e) => this.selectTab(e, C.SEARCH_OVERLAY_TABS.SEARCH_SETTINGS)}><FormattedMessage
					id="searchSettings"/></a>
				</li>
				<li className={mapStyleClasses}>
					<a href="#" onClick={(e) => this.selectTab(e, C.SEARCH_OVERLAY_TABS.MAP_STYLES)}><FormattedMessage
					id="mapStyles"/></a>
				</li>
			</ul>
			{this.getContent()}
		</Overlay>
		);
	}
}

export default injectIntl(connect(state => ({
	userLocationFound: state.user.userLocationFound,
	searchSettings: state.searchSettings,
	settingsOverlay: state.settingsOverlay,
	mapSettings: state.mapSettings,
	viewportMode: state.env.viewportMode
}))(SettingsOverlay));


class SearchSettings extends Component {
	constructor(props) {
		super(props);
		this.toggleScientificName = this.toggleScientificName.bind(this);
	}

	getSearchRow() {
		const { location, search } = this.props;
		if (!location) {
			return false;
		}

		return (
		<footer>
			<button className="btn btn-primary" onClick={search}>
				<FormattedMessage id="search"/>
			</button>
		</footer>
		);
	}

	toggleScientificName() {
		const { dispatch, showScientificName } = this.props;
		dispatch(actions.setScientificNameVisibility(!showScientificName));
	}

	render() {
		const { dispatch, searchType, zoomHandling, observationRecency, showScientificName, intl } = this.props;

		const autoZoomTooltip = (
		<Tooltip id="search-results-tooltip">
			<div>
				<FormattedMessage id="autoZoomSetting1"/>
				<ul>
					<li><FormattedMessage id="autoZoomSetting2"
										  values={{ autoZoom: <b>{intl.formatMessage({ id: 'autoZoom' })}</b> }}/></li>
					<li><FormattedMessage id="autoZoomSetting3" values={{
						showFullSearch: <b>{intl.formatMessage({ id: 'showFullSearchRange' })}</b>
					}}/></li>
				</ul>
			</div>
		</Tooltip>
		);

		const searchTypeTooltip = (
		<Tooltip id="search-type-tooltip">
			<div>
				<FormattedMessage id="resultType1"/>
				<ul>
					<li><FormattedMessage id="resultType2" values={{
						birdSightings: <b>{intl.formatMessage({ id: 'birdSightings' })}</b>
					}}/></li>
					<li><FormattedMessage id="resultType3" values={{
						notableSightings: <b>{intl.formatMessage({ id: 'notableSightings' })}</b>
					}}/></li>
				</ul>
			</div>
		</Tooltip>
		);

		return (
		<div>
			<div className="settings-row">
				<span className="settings-row-label"><FormattedMessage id="show"/></span>
				<span className="search-type">
            <span>
              <input type="radio" name="search-type" id="rt1"
					 checked={searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.ALL}
					 onChange={() => {
						 dispatch(actions.setSearchType(C.SEARCH_SETTINGS.SEARCH_TYPES.ALL));
					 }}/>
              <label htmlFor="rt1"><FormattedMessage id="birdSightings"/></label>
            </span>
            <span>
              <OverlayTrigger placement="left" overlay={searchTypeTooltip}>
                <span className="zoom-tip glyphicon glyphicon-info-sign"/>
              </OverlayTrigger>
              <input type="radio" name="search-type" id="rt2" className="margin-left"
					 checked={searchType === C.SEARCH_SETTINGS.SEARCH_TYPES.NOTABLE}
					 onChange={() => {
						 dispatch(actions.setSearchType(C.SEARCH_SETTINGS.SEARCH_TYPES.NOTABLE));
					 }}/>
              <label htmlFor="rt2" id="notable-sightings-setting"><FormattedMessage id="notableSightings"/></label>
            </span>
          </span>
			</div>

			<div className="settings-row">
				<span className="settings-row-label"><FormattedMessage id="searchResults"/></span>
				<span className="search-results">
            <span>
              <input type="radio" name="zoom-handling" id="zh1"
					 checked={zoomHandling === C.SEARCH_SETTINGS.ZOOM_HANDLING.AUTO_ZOOM}
					 onChange={() => {
						 dispatch(actions.setZoomHandling(C.SEARCH_SETTINGS.ZOOM_HANDLING.AUTO_ZOOM));
					 }}/>
              <label htmlFor="zh1"><FormattedMessage id="autoZoom"/></label>
            </span>
            <span>
              <OverlayTrigger placement="left" overlay={autoZoomTooltip}>
                <span className="zoom-tip glyphicon glyphicon-info-sign"/>
              </OverlayTrigger>
              <input type="radio" name="zoom-handling" className="margin-left" id="zh2"
					 checked={zoomHandling === C.SEARCH_SETTINGS.ZOOM_HANDLING.FULL_SEARCH}
					 onChange={() => {
						 dispatch(actions.setZoomHandling(C.SEARCH_SETTINGS.ZOOM_HANDLING.FULL_SEARCH));
					 }}/>
              <label htmlFor="zh2" id="zoom-handling-setting"><FormattedMessage id="showFullSearchRange"/></label>
            </span>
          </span>
			</div>

			<div className="settings-row">
				<span className="settings-row-label"><FormattedMessage id="speciesName"/></span>
				<span className="search-type scientific-name-field">
            <span>
              <input type="checkbox" id="scientific-name" checked={showScientificName}
					 onChange={this.toggleScientificName}/>
                <label htmlFor="scientific-name"><FormattedMessage id="includeSciName"/></label>
            </span>
          </span>
			</div>

			<div className="observation-recency-setting">
          <span>
            <FormattedMessage id="showObservationsMade"
							  values={{
								  days: <DaysDropdown value={observationRecency} onChange={(val) => {
									  dispatch(actions.setObservationRecency(val));
								  }}/>
							  }}/>
          </span>
			</div>

			{this.getSearchRow()}
		</div>
		);
	}
}
SearchSettings.propTypes = {
	searchType: PropTypes.string.isRequired,
	zoomHandling: PropTypes.string.isRequired,
	observationRecency: PropTypes.string.isRequired,
	location: PropTypes.string.isRequired
};


class MapStyles extends Component {
	render() {
		const { dispatch, intl, selected } = this.props;
		const defaultStyleClasses = (selected === C.MAP_STYLES.DEFAULT) ? 'selected' : '';
		const greyStyleClasses = (selected === C.MAP_STYLES.GREY) ? 'selected' : '';
		const darkGreyStyleClasses = 'row-end' + ((selected === C.MAP_STYLES.DARK_GREY) ? ' selected' : '');
		const neonStyleClasses = (selected === C.MAP_STYLES.NEON) ? 'selected' : '';
		const oldStyleClasses = (selected === C.MAP_STYLES.OLD_STYLE) ? 'selected' : '';
		const aquaStyleClasses = 'row-end' + ((selected === C.MAP_STYLES.AQUA) ? ' selected' : '');

		return (
		<div className="map-styles-tab">
			<div className="settings-row">
				<ul id="map-styles">
					<li className={defaultStyleClasses} onClick={() => {
						dispatch(actions.selectMapStyle(C.MAP_STYLES.DEFAULT));
					}}>
						<div>
							<img src="images/map-styles/default.png"/>
							<FormattedMessage id="default" tagName="div"/>
						</div>
					</li>
					<li className={greyStyleClasses} onClick={() => {
						dispatch(actions.selectMapStyle(C.MAP_STYLES.GREY))
					}}>
						<div>
							<img src="images/map-styles/grey.png"/>
							<FormattedMessage id="grey" tagName="div"/>
						</div>
					</li>
					<li className={darkGreyStyleClasses} onClick={() => {
						dispatch(actions.selectMapStyle(C.MAP_STYLES.DARK_GREY))
					}}>
						<div>
							<img src="images/map-styles/dark.png"/>
							<FormattedMessage id="darkGrey" tagName="div"/>
						</div>
					</li>
					<li className={neonStyleClasses} onClick={() => {
						dispatch(actions.selectMapStyle(C.MAP_STYLES.NEON))
					}}>
						<div>
							<img src="images/map-styles/neon.png"/>
							<FormattedMessage id="neon" tagName="div"/>
						</div>
					</li>
					<li className={oldStyleClasses} onClick={() => {
						dispatch(actions.selectMapStyle(C.MAP_STYLES.OLD_STYLE))
					}}>
						<div>
							<img src="images/map-styles/old-style.png"/>
							<FormattedMessage id="oldStyle" tagName="div"/>
						</div>
					</li>
					<li className={aquaStyleClasses} onClick={() => {
						dispatch(actions.selectMapStyle(C.MAP_STYLES.AQUA))
					}}>
						<div>
							<img src="images/map-styles/aqua.png"/>
							<FormattedMessage id="aqua" tagName="div"/>
						</div>
					</li>
				</ul>
			</div>
		</div>
		);
	}
}


class DaysDropdown extends Component {
	getDays() {
		const days = [1, 2, 3, 4, 5, 7, 10, 14, 20, 30];
		return days.map((day) => <option value={day} key={day}>{day}</option>);
	}

	render() {
		const { value, onChange } = this.props;
		return (
			<select className="num-days" value={value} onChange={(e) => { onChange(e.target.value); }}>
			{this.getDays()}
			</select>
		);
	}
}
DaysDropdown.propTypes = {
	onChange: PropTypes.func.isRequired
};


