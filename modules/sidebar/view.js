/**
 * Contains everything related to the webpage itself.
 */
define([
	"jquery"
], function($) {

	// DOM fields
	var _searchField = null;
	var _searchType = null; // all, notable


	// keeps track of which page viewport mode we're in
	var _currViewportMode = null; // mobilePortrait / mobileLandscape / desktop
	var _currMobilePage = 'search'; // search / results


	var _VIEWPORT_WIDTH_BREAKPOINT = 640;


	var _init = function() {
		_searchType  = $('#searchType')[0];
		_searchField = $('#searchTextField')[0];

		_onWindowResize();
		_addEventHandlers();
	};


	var _addEventHandlers = function() {
		$(window).resize(_onWindowResize);

		$('#aboutLink').on('click', function(e) {
			e.preventDefault();
			$('#about').modal();
		});
		$('#contactLink').on('click', function(e) {
			e.preventDefault();
			$('#contact').modal();
		});

		$('#sidebar form').bind('submit', manager.search);
		$('#backLeft,#backTop').bind('click', manager.showSearchPage);
		$('#panelTabs').on('click', 'li', manager.onClickSelectTab);
		$('#searchType').on('change', manager.onChangeSearchType);
		$('#fullPageSearchResults,#locationsTabContent').on('click', '.toggle', manager.toggleAllCheckedHotspots);
		$('#fullPageSearchResults').on('click', 'tbody input', manager.toggleSingleCheckedHotspot);
		$('#fullPageSearchResults').on('mouseover', 'tbody tr', manager.onHoverHotspotRow);
		$('#fullPageSearchResults').on('mouseout', 'tbody tr', manager.onHoverOutHotspotRow);
		$('#birdSpeciesTable').on('click', '.toggleBirdSpeciesLocations', manager.onClickToggleBirdSpeciesLocations);
		$(document).on('click', '.viewLocationBirds', manager.displaySingleHotspotBirdSpecies);
		$(document).on('click', '.returnToSearch', function() {
			manager.showSearchPage();
			$.modal.close();
		});
	};


	// boy I can't wait for flexbox
	var _onWindowResize = function() {
		var windowHeight = $(window).height();
		var windowWidth = $(window).width();

		_currViewportMode = 'desktop';
		if (windowWidth < _VIEWPORT_WIDTH_BREAKPOINT) {
			if (windowHeight < windowWidth) {
				_currViewportMode = 'mobileLandscape';
			} else {
				_currViewportMode = 'mobilePortrait';
			}
		}

		// for desktop-sized interfaces, we show everything, with the search and results in the left
		// sidebar
		if (_currViewportMode == 'desktop') {
			$('#locationsTab').addClass('hidden');
			$('#sidebar').css('height', windowHeight - 77);
			$('#mainPanel').css({
				height: windowHeight - 54,
				width: windowWidth - 323
			});
			$('#panelContent').css({
				height: windowHeight - 82,
				width: 'auto'
			});
			$('#fullPageSearchResults').css('height', windowHeight - 267);

			// for mobile, due to limited real-estate we put the search form on a separate page and
			// show a "back" link/button, whose location depends on the current orientation of the device
		} else {

			$('#locationsTab').removeClass('hidden');
			$('#sidebar').css('height', 'auto');

			if (_currViewportMode == 'mobileLandscape') {
				$('#panelContent').css({
					height: windowHeight - 75,
					width: windowWidth - 50
				});
				var top = (windowHeight / 2) - 42;
				$('#backLeft div').css({ top: top });
			} else {
				$('#panelContent').css({
					height: windowHeight - 140,
					width: 'auto'
				});
			}

			var panelHeight = windowHeight - 210;
			$('#mainPanel').css({
				height: panelHeight + 'px',
				width: '100%'
			});
		}

		if (_currTabID == 'mapTab' && (_currViewportMode != 'desktop' && _currMobilePage == 'results')) {
			var address = $.trim(_searchField.value);
			if (address !== '') {
				_updatePage(false);
			}
		}
	};


	return {
		init: _init
	};
});