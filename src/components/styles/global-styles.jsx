import { C } from '../../core/core';
import { injectGlobal } from 'styled-components';


// originally 1500 lines. The bulk of this can be moved somewhere appropriate

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
    flex: 0 0 300px;
    margin: 0;
  }
  .header-search {
    flex: 1;
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
    flex: 0 1 120px;
    padding-left: 0;
    span {
      color: #111111;
    }
  }

  &>span {
    flex: 1;
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
        flex: 1;
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


// icons
injectGlobal`
// Generated through: https://icomoon.io/app/
@font-face {
  font-family: 'icomoon';
  src:  url('../fonts/icomoon.eot?ixgtpz');
  src:  url('../fonts/icomoon.eot?ixgtpz#iefix') format('embedded-opentype'),
  url('../fonts/icomoon.ttf?ixgtpz') format('truetype'),
  url('../fonts/icomoon.woff?ixgtpz') format('woff'),
  url('../fonts/icomoon.svg?ixgtpz#icomoon') format('svg');
  font-weight: normal;
  font-style: normal;
}

[class^="icon-"], [class*=" icon-"] {
  /* use !important to prevent issues with browser extensions that change fonts */
  font-family: 'icomoon' !important;
  speak: none;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  width: inherit;
  height: inherit;
  margin-top: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-user:before {
  content: "\\e971";
}
.icon-cog:before {
  content: "\\e994";
}
.icon-pie-chart:before {
  content: "\\e99a";
}
.icon-info:before {
  content: "\\ea0c";
}
.icon-wikipedia:before {
  content: "\\eac8";
}

header .icon {
  font-size: 14pt;
  transition: all ${C.STYLES.TRANSITION_SPEED};
  background: none;
  &:hover {
    color: $blue;
  }
}
`;


injectGlobal`
#map-overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #000000;
  opacity: 0.35;
  z-index: 3;
  &.editable-header {
	  top: 60px;
  }
}

.section-header {
  z-index: 2;
  height: 28px;
  cursor: pointer;
  flex: 0 1 auto;
  &>div {
    position: relative;
    width: 100%;
  }
  h2 {
    display: inline-block;
    color: white;
    font-family: ${C.STYLES.WEBFONT};
    font-size: 16px;
    margin: 0 0 0 10px;
    line-height: 23px;
    > span, > div {
      display: inline-block;
      vertical-align: middle;
	}
    .line-loader {
      margin-top: -4px;
    }
  }
  .toggle-section {
    float: right;
    margin: 6px 9px;
    color: #999999;
    font-size: 13px;
    transition: all ${C.STYLES.TRANSITION_SPEED};
  }
  &:hover {
    .toggle-section {
      color: #0099cc;
    }
  }
  .total-count {
    padding: 0 4px;
    border-radius: 4px;
    margin-left: 4px;
    display: inline;
    font-size: 12px;
  }
}

#locations-panel {
  position: absolute;
  top: 60px;
  left: 0;
  width: 300px;
  display: flex;
  flex-direction: column;

  header, footer {
    background-color: rgba(26, 29, 34, 0.71);
    &:hover {
      background-color: rgba(26, 29, 34, 0.75);
    }
  }
  .panel {
    background-color: rgba(0, 0, 5, 0.78);
	flex: 1;
  }
  table {
    width: inherit;
    margin-bottom: 0;
  }
  .section-header {
    left: 0;
  }
  span.num-locations {
    background-color: #0099cc;
  }
  table, td, th {
    padding: 0;
    font-size: 9pt;
    text-align: left;
  }
  tr {
    height: 23px;
    &.loading {
      color: #777777;
    }
  }
  .location {
    padding-left: 10px;
    width: 260px;
    div {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      width: 230px;
    }
  }
  .num-species {
    text-align: center;
  }
  .all-locations-row {
    color: white;
    font-weight: bold;
  }
  tbody {
    overflow-x: auto;
    tr {
      &:not(.loading):hover .location {
        color: #0099cc;
      }
      &:not(.loading):hover {
        cursor: pointer;
      }
    }
  }
}

#locations-panel-content > div, #species-panel-content > div {
	display: flex;
	flex-direction: column;
	height: 100%;
	.panel {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow-x: hidden;
	}
	footer {
		flex: 0 0 auto;
		text-align: center;
		cursor: pointer;
		span {
			font-size: 15px;
			transition: all ${C.STYLES.TRANSITION_SPEED};
		}
		&:hover {
			span {
				color: #0099cc;
			}
		}
	}
}
#species-panel-content {
  margin-left: -1px;
  & > div .panel table {
    flex: 1;
  }
  .eBirdLink {
    float: right;
    font-size: 9pt;
    margin: 20px 0 0;
    a {
      color: #cccccc;
      span.eBird {
        color: green;
      }
      &:hover {
        color: white;
      }
      span.eBirdOffsiteIcon {
        margin-left: 5px;
        font-size: 10px;
      }
    }
  }
}

.filter-locations-row {
	flex: 0 0 auto;
	padding: 8px 10px 0;
	position: relative;
	margin-bottom: 8px;
	input {
		width: 100%;
	}
}

body .clear-filter-icon {
	position: absolute;
	top: 15px;
	right: 16px;
	font-size: 15px;
	cursor: pointer;
	&:hover {
		color: #555555;
	}
}

.species-heading-row {
	position: relative;
	padding: 8px 0 4px;
	flex: 0 0 auto;
	margin: 0 4px;
	border-bottom: 1px solid #666666;

	h1 {
		float: left;
		font-size: 24px;
		margin: 10px 0 0;
		line-height: 40px;
		font-family: "helvetica neue", helvetica, Arial, sans-serif;
		a {
			color: #cccccc;
		}
	}
	.counter {
		margin: 18px 10px 0;
		float: left;
	}
	.delimiter {
		font-size: 8pt;
		color: #666666;
		margin: 6px;
	}
	.range {
		text-align: center;
		margin-left: 6px;
	}
}

.species-table {
	flex: 1;
	overflow: hidden;

	.filter-field {
		margin: 0;
	}
	.row-num {
		width: 4%;
	}
	.species-col {
		width: 45%;
		position: relative;
		span {
			display: inline-block;
		}
		input {
			float: right;
			width: 192px;
			font-weight: normal;
		}
	}
	.last-seen {
		width: 20%;
		div {
			margin-left: -10px;
		}
	}
	.locations-seen {
		width: 20%;
	}
	.num-reported {
		width: 60px;
	}
	.unknown-count {
		color: #555555;
	}
	.icon {
		width: 22px;
		height: 20px;
		color: #cccccc;
		display: inline-block;
		font-size: 14pt;
		&:hover {
			color: ${C.STYLES.BLUE};
		}
	}
}

.highlight {
	color: ${C.STYLES.TEXT_HIGHLIGHT_COLOR};
}

body .filter-field {
	padding: 13px 6px;
	height: 30px;
}

#locations-table-wrapper {
	flex: 1;
	overflow: auto;
	overflow-x: hidden;

	thead {
		cursor: pointer;
	}
	tbody {
		color: #cccccc;
	}
}

.col-sort {
	font-size: 10px;
	color: #0099cc;
	margin-left: 3px;
}

#species-panel {
  position: absolute;
  top: 60px;
  left: 300px;
  display: flex;
  flex-direction: column;

  .section-header {
    margin-left: -1px;
    h2 {
		text-transform: capitalize;
    }
  }

  span.num-species {
      background-color: #0099cc;
  }
  .panel {
      background-color: rgba(0, 0, 5, 0.78);
      border-left: 1px solid #666666;
	  flex: 1;
      padding: 0 10px;
      overflow: hidden;
  }
  header, footer {
      background-color: rgba(26, 29, 34, 0.71);
      border-left: 1px solid #222222;
      &:hover {
          background-color: rgba(26, 29, 34, 0.75);
      }
  }
  table {
      color: #cccccc;
      font-size: 14px;
      margin-bottom: 0;
      td {
          line-height: 15px;
          vertical-align: middle;
      }
  }
}

.range {
	border-radius: 2px;
	padding: 1px 4px;
	font-size: 10px;
	display: inline-block;
	width: 32px;
	font-weight: bold;
}
.range1 {
	background-color: ${C.STYLES.RANGE1};
	color: #333333;
}
.range2 {
	background-color: ${C.STYLES.RANGE2};
	color: #333333;
}
.range3 {
	background-color: ${C.STYLES.RANGE3};
	color: #ffffff;
}
.range4 {
	background-color: ${C.STYLES.RANGE4};
	color: #ffffff;
}
.range5 {
	background-color: ${C.STYLES.RANGE5};
	color: #ffffff;
}
.range6 {
	background-color: ${C.STYLES.RANGE6};
	color: #333333;
}
.range7 {
	background-color: ${C.STYLES.RANGE7};
	color: white;
}
.range8 {
	background-color: ${C.STYLES.RANGE8};
	color: white;
}
.notableSightingsTotal {
	background-color: #0099cc;
	color: white;
}
.notableSighting {
	background-color: #85bfe9;
	color: white;
}
.row-num {
	font-size: 9px;
	color: #efefef;
	width: 20px;
}

.table .species-col {
	>div {
		position: relative;

		a.com-name {
			color: #ffffff;
			float: left;
			text-decoration: none;
			&:after {
				display: none;
			}
			&:hover {
				color: ${C.STYLES.BLUE};
				span.icon {
					color: ${C.STYLES.BLUE};
				}
			}
			span.icon {
				font-size: 14px;
				margin-left: 5px;
				height: 12px;
				&:hover {
					color: inherit;
				}
			}
		}
	}
}

.sci-name {
	font-size: 10px;
	color: #999999;
	clear: both;
}

.species-num-locations {
	position: relative;
	width: 40px;
	background-color: rgba(26, 29, 34, 0.91);
	color: white;
	border-radius: 3px;
	text-align: center;
	display: inline-block;
	cursor: pointer;
	padding: 2px;
	font-size: 12px;
	margin-left: 23px;
}

.species-num-locations-cell {
	position: relative;
}

#locations-popover {
	width: 300px;
	margin-left: 22px;

	.popover-content {
		font-size: 12px;
		max-height: 200px;
		overflow: auto;
		padding: 6px 14px 9px;

		li {
			cursor: pointer;
			line-height: inherit;
			display: flex;
			flex-direction: row;
			padding: 2px 0;
			span, a {
				padding: 1px 0;
				&:hover {
					color: ${C.STYLES.BLUE};
				}
			}
			span {
				flex: 1;
			}
			a {
				flex-grow: 0;
				&:after {
					content: ''
				}
			}
			border-bottom: 1px solid #222222;
			&:last-child {
				border-bottom: none;
			}
		}
	}
	ul {
		list-style-type: none;
		margin: 0;
		padding: 0;
	}
}

.species-table {
	display: flex;
	flex-direction: column;
}
.species-table-header {
	flex: 0 0 auto;
	border-bottom: 2px solid black;
	.last-seen {
		width: 21%;
	}
}
.species-header {
	margin-top: 8px;
}
.species-table-content-wrapper {
	flex: 1;
	overflow-x: hidden;
	overflow-y: scroll;
}
.species-loading {
	display: inline-block;
	margin-left: 4px;
	> div {
		background-color: white;
	}
}
.sortable {
  cursor: pointer;
  span {
    transition: all ${C.STYLES.TRANSITION_SPEED};
    &:hover {
      color: #d3e4f9;
    }
  }
}

.bird-location-sightings {
  a {
	color: white;
    &:hover {
        color: ${C.STYLES.BLUE};
    }
  }
}

.nav-pills > .active > a {
	background-color: ${C.STYLES.BLUE};
}

.nav-pills li > a:hover {
	background-color: ${C.STYLES.BLUE};
}

/** the notable sightings table just re-uses the bulk of the species-table rules, and overrides and adds a couple of things */
.notable-table {
	.confirmed {
		color: green;
	}
	.not-reviewed {
		color: #e4761e;
	}
	.reviewed {
		color: brown;
	}

	.species-table-header  {
		.status-col {
			width: 210px;
		}
		.species-col {
			width: 225px;
		}
		.location-col {
			width: 220px;
			max-width: 220px;
		}
	}
	.notable-count {
		margin-left: 6px;
		color: #85bfe9;
	}
	.checklist {
		margin-left: 10px;
		color: #cccccc;
		&:after {
			margin: 0;
		}
		&:hover {
			color: ${C.STYLES.BLUE};
		}
	}

	.location-col {
		max-width: 200px;
		width: 200px;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
	.species-col {
		width: 245px;
	}
	.icon-col {
		width: 60px;
	}
	.date-seen-col {
		width: 200px;
		white-space: nowrap;
	}
	.reporter-col {
		width: 160px;
	}
	.status-col {
		width: 110px;
	}
}

#header-settings-link {
	display: inline-block;
	position: absolute;
	top: 4px;
	font-size: 13px;
	margin-left: 20px;
}
`;
