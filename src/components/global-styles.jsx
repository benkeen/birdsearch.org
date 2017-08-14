import { C } from '../core/core';
import { injectGlobal } from 'styled-components';

// general
injectGlobal`

* {
	box-sizing: border-box;
}
body {
	box-sizing: border-box;
	padding: 0;
	font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
	line-height: 20px;
	font-size: 14pt;
	color: #cccccc;
	overflow: hidden;
	background-color: #222222;
	background-image: none;

	h1 {
		font-weight: normal;
	}
}
div {
	box-sizing: border-box;
}
section {
	padding: 0;
}
.hidden {
	display: none;
}
.clear {
	clear: both;
}
body {
	a {
		color: ${C.STYLES.BLUE};
		&:hover, &:focus {
			color: ${C.STYLES.LINK_HOVER};
			text-decoration: none;
		}
		// add an icon after all offsite links
		&[target="_blank"]:after {
			content: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAQElEQVR42qXKwQkAIAxDUUdxtO6/RBQkQZvSi8I/pL4BoGw/XPkh4XigPmsUgh0626AjRsgxHTkUThsG2T/sIlzdTsp52kSS1wAAAABJRU5ErkJggg==);
			margin: 0 3px 0 5px;
		}
	}

	// hide it for offsite links on google maps
	.gm-style a[target="_blank"]:after {
		content: '';
		margin: 0;
	}
}
a:focus {
	text-decoration: none;
}
.tablesorter thead th {
	cursor: pointer;
}
button.btn {
	box-shadow: none;
}
.close-panel {
	cursor: pointer;
}

::-webkit-scrollbar {
	width: 12px;
	height: 12px;
}
::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.1);
}
::-webkit-scrollbar-thumb {
	background: rgba(215, 215, 215, 1);
}

.capitalize, .capitalize span {
	white-space: nowrap;
	text-transform: capitalize;
}

.search-input-field {
	background-color: white;
	&::-webkit-input-placeholder,
	&::-moz-placeholder,
	&:-ms-input-placeholder,
	&:-moz-placeholder {
		color: #999999;
	}
	color: #333333;
	height: 34px;
	width: 100%;
	border: 1px solid #bbbbbb;
	border-radius: 4px;
	font-size: 14px;
}
`;

// layout
injectGlobal`
html, body {
  height: 100%;
}
body {
  display: flex;
  flex-direction: column;
}

#app {
  display: flex;
  flex-direction: column;
  flex: 1;
}

#page-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
}

header {
  display: flex;
  flex-direction: row;
  .navbar {
    @include flex(0 0 300px);
    margin: 0;
  }
  .header-search {
    @include flex(1);
  }
}

#main-panel {
  display: flex;
  flex-direction: row;
  flex: 1;
}

.flex-body {
  flex: 1;
}

.flex-fill {
  flex: 0 0 auto;
}
`;


// bootstrap overrides
injectGlobal`
.nav-pills {
  margin-bottom: 20px;
  a {
    color: ${C.STYLES.BLUE};
  }
}

h4 {
  font-size: 17.5px;
}

body {
  color: #cccccc;
  table {
    background-color: transparent;
  }

  .table-striped {
    thead {
      td, th {
        color: #cccccc;
        line-height: inherit;
        border-bottom: none;
      }
    }

    tbody>tr {
      td, th {
        line-height: inherit;
      }
      &:nth-of-type(odd) {
        background-color: inherit;
      }
      &:nth-child(odd)>td, :nth-child(odd)>th {
        background-color: rgba(100, 100, 100, .1);
      }
    }
  }

  .panel {
    margin-bottom: 0;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }
}


body {
  .popover.bottom > .arrow:after {
    border-bottom-color: #070809;
  }
  .popover-title {
    background-color: #070809;
  }
  .popover {
    padding: 0;
    background-color: #070809;
  }
  .nav-pills>li>a {
    padding: 6px 12px;
    &:hover {
      color: white;
    }
  }
  .tooltip {
    ul {
      margin-left: 0;
      padding-left: 16px;
    }
  }
}
`;


// overlays
injectGlobal`
.overlay {
  position: absolute;
  margin: auto;
  z-index: 3;
  left: 0;
  right: 0;
  top: 60px;
  bottom: 0;
  font-size: 14px;

  .close-panel {
    position: absolute;
    top: 10px;
    right: 10px;
    color: #b9b9b9;
    font-size: 18px;
    &:hover {
      color: #333333;
    }
  }
  &.loading .close-panel {
    cursor: default;
    &:hover {
      color: #b9b9b9;
    }
  }

  .tab-wrapper {
    position: relative;
    color: black;
  }
  .tab-content {
    background-color: white;
    border-radius: 6px;
    padding: 40px;
    color: ${C.STYLES.TEXT_COLOR};
  }

  .nav-pills {
    margin-top: -10px;
    margin-left: 0;
  }
}

#intro-overlay {
  height: 184px;
  width: 488px;

  .loader {
    position: absolute;
    width: 100%;
    top: 85px;
  }
  .css-loader {
    position: absolute;
    top: 92px;
  }

  .loader-label {
    text-align: center;
    letter-spacing: 2px;
    color: #2175B5;
    margin-top: 40px;
  }

  &.loading {
    .close-panel, .tab-content > * {
      opacity: 0.1;
    }
  }
  input {
    padding: 8px;
    width: 300px;
  }
  button {
    margin-top: -4px;
    width: 180px;
    margin-right: 15px;
    padding: 7px 16px;

    &.btn-primary {
      border-color: #45b6d8;
      background-image: linear-gradient(#6dc4dd, #53b9d7 60%, #45b6d8);
      &:hover,&:focus {
        background-color: #31b0d5;
      }
    }

    i {
      margin-right: 6px;
    }
  }
  .or {
    font-weight: bold;
    text-align: center;
    margin: 10px;
  }
}

#settings-overlay {
  height: 281px;
  width: 520px;
  &.with-search {
    height: 331px;
  }
  select.num-days {
    width: 60px;
  }
  footer {
    margin: 10px 0 -10px;
    padding-top: 15px;
    border-top: 1px solid #cccccc;
  }
}

#about-overlay {
  height: 304px;
  width: 600px;
}

#report-sightings-overlay {
  height: 190px;
  width: 500px;
  p {
    margin-bottom: 15px;
  }
}

#report-sightings-btn {
  padding: 6px 19px 7px 14px;
  margin: 0;
  span {
    margin-right: 4px;
  }
}

.photo {
  float: right;
  margin-left: 15px;
  border-radius: 3px;
}

.settings-row {
  display: flex;
  flex-direction: row;

  span {
    color: #888888;
    font-weight: normal;
  }

  .settings-row-label {
    @include flex(0 1 120px);
    padding-left: 0;
    span {
      color: #111111;
    }
  }

  &>span {
    @include flex(1);
    padding: 10px;
    input {
      float: left;
      margin-right: 10px;
    }
  }
  label {
    margin-bottom: 0;
    display: inline-block;
    float: left;
  }
  span.zoom-tip {
    float: right;
    cursor: pointer;
    color: ${C.STYLES.BLUE};
    &:hover {
      color: ${C.STYLES.LINK_HOVER};
    }
  }
  .margin-left {
    margin-left: 15px;
  }
}

.observation-recency-setting {
  margin-top: 7px;
  margin-bottom: 4px;
}

.num-days {
  margin: 0 5px;
  vertical-align: middle;
}

#search-type-tooltip, #search-results-tooltip {
  width: 350px;
  .tooltip-inner {
    text-align: left;
    font-size: 13.5px;
    padding: 15px;
    max-width: 350px;
    b {
      color: #85bfe9;
    }
    ul {
      margin-top: 8px;
    }
  }
  &.in {
    opacity: 0.85;
  }
}


#map-styles {
  margin: 0;
  padding: 0;
  list-style-type: none;
  li {
    display: inline-block;
    margin: 0 10px 10px 0;
    cursor: pointer;

    &.row-end {
      margin-right: 0;
    }
    &.selected {
      background-color: ${C.STYLES.BLUE};
      color: white;
      div div {
        color: white;
      }
    }
    &:hover {
      background-color: ${C.STYLES.BLUE};
      div div {
        color: white;
      }
    }

    div div {
      text-align: center;
      font-size: 12px;
      color: #666666;
      padding: 2px 0;
    }
  }
}

.map-styles-tab {
  margin-bottom: -20px;
}
`;

// mobile
injectGlobal`
#mobile-search-row {
  display: none;
}

@media (max-width: 768px) {
  .notable-table .location-col {
    width: inherit;
    max-width: inherit;
  }

  .overlay .tab-content {
    border-radius: 0;
  }

  #mobile-search-row {
    display: flex;
  }

  #about-overlay {
    width: 100%;
  }

  #locations-table-wrapper {
    margin-top: 15px;
  }

  #intro-overlay {
    width: 100%;
    max-width: 416px;
    height: 234px;
    span {
      display: block;
    }
    .loader {
      top: 108px;
    }
    .tab-content {
      padding-bottom: 26px;
      & > div {
        text-align: center;
      }
    }
    button {
      width: 100%;
      margin-bottom: 8px;
      span {
        display: inline;
      }
    }
    .or {
      margin: 12px;
    }
    #searchAnywhere {
      margin-top: 0;
    }
  }

  .photo {
    display: none;
  }

  #settings-overlay {
    width: 100%;
    height: 344px;

    &.with-search {
      height: 394px;
    }

    .search-type, .search-results {
      position: relative;
      & > span {
        display: block;
      }
    }
    .zoom-tip {
      position: absolute;
      right: -8px;
      top: 13px;
    }
    .settings-row {
      .margin-left {
        float: none;
        margin-left: 0;
      }
      label {
        float: none;
      }
      span input {
        float: none;
      }

      .settings-row-label {
        flex: 0 1 108px;
      }
    }

    select.num-days {
      background-color: #efefef;
      width: 56px;
    }

    #map-styles li {
      margin: 0 5px 10px 0;
    }
  }

  #search-type-tooltip, #search-results-tooltip {
    width: 304px;
  }

  #intro-tooltip {
    top: 110px !important;
    left: 5px !important;
  }
  #mobile-search-row {
    display: flex;
    height: 45px;
  }
  header .header-search {
    position: absolute;
    left: 0;
    top: 46px;
    width: 100%;
  }
  #map-overlay.editable-header {
    top: 105px;
  }
  #locations-panel {
    top: 105px;
    width: 100%;
    .section-header {
      width: 50%;
    }
  }

  #locations-popover {
    width: 220px;
    margin-left: 14px;
    &.left>.arrow:after {
      border-left-color: #070809;
    }
  }

  #species-panel {
    top: 105px;
    left: 0;
    width: 100% !important;

    .section-header {
      margin-left: 50%;
    }
    .filter-field {
      display: none;
    }

    header, footer {
      border-left: 0;
    }
  }

  .species-num-locations {
    margin-left: 0;
  }

  #locations-panel, #species-panel {
    .section-header {
      .toggle-section {
        color: #ffffff;
      }
      &.visible {
        background-color: #1c6178;
      }
    }
  }

  .species-table .species-col {
    width: auto;
  }

  .species-table .row-num {
    width: 26px;
  }

  header .nav-items {
    display: none;
  }

  .filter-locations-row {
    display: none;
  }

  #locations-panel .location {
    width: 100%;
    div {
      width: inherit;
    }
  }

  .locations-table-wrapper {
    .range {
      margin-right: 10px;
    }
  }
  .num-species span {
    margin-right: 10px;
  }
}

.icon-bar {
  background-color: white;
}

.navbar-toggle {
  position: absolute;
  right: 0;
  top: 5px;
}

#mobile-navbar {
  position: absolute;
  left: 0;
  top: 58px;
  width: 100%;
  background-color: #333333;
  overflow: hidden;
  z-index: 4;
  list-style-type: none;
  margin: 0;
  padding: 0;
  box-shadow: none;

  li {
    padding: 14px 19px;
    color: #efefef;
    font-size: 14px;
  }

  li.mobile-local-selector {
    background-color: #262626;
    padding: 0;
    font-style: italic;

    ul {
      list-style-type: none;
      margin: 0;
      padding: 0;
      border-top: 1px solid #666666;
      display: flex;
      flex-direction: row;

      li {
        @include flex(1);
        cursor: pointer;
        margin: 5px;
        padding: 6px;
        text-align: center;
        border-radius: 4px;
        font-size: 13px;
        &.active {
          background-color: #1f6880;
        }
        &:hover {
          background-color: #666666;
        }
      }
    }
  }
}


@media (min-width: 768px) {
  #mobile-navbar {
    display: none !important;
  }
}
`;
