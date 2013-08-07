/*jslint browser:true*/
/*global $:false,map:false,google:false,console:false,moment:false*/
define([
	"jquery",
	"../../modules/map/map",
	"tablesorter"
], function($, map) {

	'use strict';

	// tracks the main hotspot searches to prevent unnecessary duplicates
	var _hotspotSearches = {};

	// hotspots currently visible in the map viewport. Array of location ID. The actual hotspot data
	// is stored in allHotspots
	var _visibleHotspots = [];
	var _numVisibleHotspots = null;

	// all hotspot results for a region. This just keeps getting appended to as the user does new
	// searches, drags/zooms the map. Unlikely it would get TOO massive in a single session,
	// plus it lets us be nice to eBird's servers and not re-request the same data multiple times
	var _allHotspots = {};

	// keeps track of all species currently in the visible subset of hotspots
	var _speciesInVisibleHotspots = {};
	var _numSpeciesInVisibleHotspots = 0;
	var _regionType = null;
	var _region = null;
	var _observationRecency = null;


	var _activeHotspotRequest = false;
	var _currTabID = 'mapTab';
	var _currentHoveredRowLocationID = null;
	var _maxHotspotsReached = false;

	// keeps track of whether the Location column in the Bird Species tab should be expanded or not
	var _birdSpeciesLocationDetailsExpanded = false;

	// constants
	var _CURRENT_SERVER_TIME = null;
	var _ONE_DAY_IN_SECONDS = 24 * 60 * 60;
	var _MAX_HOTSPOTS = 50;



	var _init = function() {


		// make a note of the current server time. This is used to ensure date calculations don't go
		// wonky if the user's system clock is off
		_CURRENT_SERVER_TIME = parseInt($('body').data('serverdatetime'), 10);


		// set the default values
		_observationRecency = parseInt($('#observationRecency').val(), 10);
		_searchType = $('#searchType').val();
		$(manager.searchField).focus();

		// initialize the map
		map.init();
	};


	var search = function(e) {
		e.preventDefault();

		// if the focus is on the location field, don't submit the form - they just did the auto-complete
		if ($('#searchTextField').is(':focus')) {
			return;
		}

		manager.observationRecency = parseInt($('#observationRecency').val(), 10);
		var address = $.trim(manager.searchField.value);
		if (address !== '' && map.currPlace !== null) {
			if (!map.currPlace.geometry) {
				return;
			}
			var numAddressComponents = map.currPlace.address_components.length;
			var countryCode = map.currPlace.address_components[numAddressComponents-1].short_name;
			var subNational1Code;

			var isValid = true;
			if (manager.searchType === 'all' && numAddressComponents < 3) {
				helper.showMessage('Please enter a more specific location.', 'error');
				isValid = false;
			} else if (numAddressComponents < 2) {
				helper.showMessage('Please enter a more specific location.', 'error');
				isValid = false;
			}

			if (isValid) {
				map.lastAddressSearchValid = true;
				$('#messageBar').addClass('hidden');
				subNational1Code = map.currPlace.address_components[numAddressComponents-2].short_name;
				manager.regionType = 'subnational1';
				manager.region = countryCode + "-" + subNational1Code;

				if (manager.searchType === 'all') {
					manager.getHotspots();
				} else {
					manager.getNotableObservations();
				}
			}
		}
	};


	var manager = {
		onHoverHotspotRow: function(e) {
			var id = $(e.currentTarget).attr('id');
			if (id) {
				var locationID = id.replace(/^location_/, '');
				map.markers[locationID].setIcon('resources/images/marker2.png');
				map.markers[locationID].setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
				manager.currentHoveredRowLocationID = locationID;
			}
		},

		onHoverOutHotspotRow: function() {
			if (manager.currentHoveredRowLocationID !== null && map.markers.hasOwnProperty(manager.currentHoveredRowLocationID)) {
				map.markers[manager.currentHoveredRowLocationID].setIcon('resources/images/marker.png');
			}
			manager.currentHoveredRowLocationID = null;
		},

		/**
		 * Called whenever the user clicks the (+) or (-) in the Bird Species tab to expand/contract the list of Locations Seen
		 * for either a single bird, or all birds in the tab.
		 */
		onClickToggleBirdSpeciesLocations: function(e) {
			e.preventDefault();
			var tr = $(e.target).closest('tr');

			// find out if this is the header or just a table row
			if ($(e.target).html() == '(-)') {
				$(e.target).html('(+)');
				$(e.target).parent().find('.birdLocations').addClass('hidden');
				tr.find('.lastSeenSingle').css('visibility', 'visible');
				tr.find('.lastSeenDetails').addClass('hidden');
			} else {
				$(e.target).html('(-)');
				$(e.target).parent().find('.birdLocations').removeClass('hidden');
				tr.find('.lastSeenSingle').css('visibility', 'hidden');
				tr.find('.lastSeenDetails').removeClass('hidden');
			}
		},

		onChangeSearchType: function(e) {
			manager.searchType = $(e.target).val();
		},

		/**
		 * Separate from the previous method because we don't want to fire the tablesort events when the user clicks the
		 * (+), so we can event delegate it on the top level table.
		 */
		onMouseUpToggleAllBirdSpeciesLocation: function(e) {
			e.stopImmediatePropagation();

			if (manager.birdSpeciesLocationDetailsExpanded) {
				$('#speciesTable tbody .toggleBirdSpeciesLocations').html('(+)');
				$('#speciesTable tbody .birdLocations').addClass('hidden');
				$('#speciesTable tbody .lastSeenSingle').css('visibility', 'visible');
				$('#speciesTable tbody .lastSeenDetails').addClass('hidden');
			} else {
				$('#speciesTable tbody .toggleBirdSpeciesLocations').html('(-)');
				$('#speciesTable tbody .birdLocations').removeClass('hidden');
				$('#speciesTable tbody .lastSeenSingle').css('visibility', 'hidden');
				$('#speciesTable tbody .lastSeenDetails').removeClass('hidden');
			}
			manager.birdSpeciesLocationDetailsExpanded = !manager.birdSpeciesLocationDetailsExpanded;
		},

		/**
		 * Retrieves all hotspots for a region.
		 */
		getHotspots: function() {

			// if a hotspot search for this searchType, regionType, region and <= recency has already been made, don't bother doing another.
			// We can safely do this because the original request will retrieve ALL locations, just not request their observations
			// (a far more weighty request load) if they're not in the viewport
			var searchKey = 'all-' + manager.regionType + '--' + manager.region;
			if (manager.hotspotSearches.hasOwnProperty(searchKey)) {
				if (manager.observationRecency <= manager.hotspotSearches[searchKey].recency) {
					manager.showMobileResults();
					manager.redrawMap();

					// this function does the job of trimming the list for us, if there are > MAX_HOTSPOTS
					manager.visibleHotspots = map.addMarkers({ searchType: 'all', clearMarkers: true });
					manager.numVisibleHotspots = manager.visibleHotspots.length;
					manager.displayHotspots();
					manager.getAllHotspotObservations();
					return;
				}
			}
			manager.activeHotspotRequest = true;
			manager.startLoading();

			$.ajax({
				url: "ajax/getHotspots.php",
				data: {
					regionType: manager.regionType,
					region: manager.region,
					recency: manager.observationRecency
				},
				type: "POST",
				dataType: "json",
				success: function(response) {
					manager.activeHotspotRequest = false;

					// store the hotspot data. This will probably contain more results than are currently
					// needed to display, according to the current viewport. That's cool. The map code
					// figures out what needs to be shown and ignores the rest.
					if ($.isArray(response)) {

						// make a note that we've performed a search on this region
						manager.hotspotSearches[searchKey] = {
							recency: manager.observationRecency
						};

						for (var i=0; i<response.length; i++) {
							var locationID = response[i].i;
							if (!manager.allHotspots.hasOwnProperty(locationID)) {

								//response[i].fromAllObservationSearch = true;

								manager.allHotspots[locationID] = response[i];
								manager.prepareHotspotDataStructure(locationID);
							}
						}

						manager.updatePage(true);
					} else {
						manager.stopLoading();
					}
				},
				error: function(response) {
					manager.activeHotspotRequest = false;
					manager.stopLoading();
				}
			});
		},

		getNotableObservations: function() {

			// if a hotspot search for this searchType, regionType, region and <= recency has already been made, don't bother doing another.
			// We can safely do this because the original request will retrieve ALL locations, just not request their observations
			// (a far more weighty request load) if they're not in the viewport
			// var searchKey = 'notable-' + manager.regionType + '--' + manager.region;
			// if (manager.hotspotSearches.hasOwnProperty(searchKey)) {
			// 	if (manager.observationRecency <= manager.hotspotSearches[searchKey].recency) {

			// 		manager.showMobileResults();
			// 		manager.redrawMap();

			// 		// this function does the job of trimming the list for us, if there are > MAX_HOTSPOTS
			// 		manager.visibleHotspots = map.addMarkers(true);
			// 		manager.numVisibleHotspots = manager.visibleHotspots.length;
			// 		manager.displayHotspots();
			//		manager.getAllHotspotObservations();
			// 		return;
			// 	}
			// }

			manager.activeHotspotRequest = true;
			manager.startLoading();

			$.ajax({
				url: "ajax/getNotableSightings.php",
				data: {
					regionType: manager.regionType,
					region: manager.region,
					recency: manager.observationRecency
				},
				type: "POST",
				dataType: "json",
				success: function(response) {
					// manager.activeHotspotRequest = false;

					// // store the hotspot data. This will probably contain more results than are currently
					// // needed to display, according to the current viewport. That's cool. The map code
					// // figures out what needs to be shown and ignores the rest.
					if ($.isArray(response)) {

						// make a note that we've performed a search on this region
						// manager.hotspotSearches[searchKey] = {
						// 	recency: manager.observationRecency
						// };

						for (var i=0; i<response.length; i++) {
							var locationID = response[i].i;
							if (!manager.allHotspots.hasOwnProperty(locationID)) {
								//response[i].fromNotableObservationSearch = true;
								manager.allHotspots[locationID] = response[i];
								manager.prepareHotspotDataStructure(locationID);
							}
						}

						manager.updatePage(true);
					} else {
						manager.stopLoading();
					}
				},
				error: function(response) {
					manager.activeHotspotRequest = false;
					manager.stopLoading();
				}
			});

		},

		/**
		 * Called after the hotspot locations have been loaded. This adds them to the Google Map and
		 * starts initiating the observation requests.
		 *
		 * TODO this function name sucks. What does it DO?!
		 */
		updatePage: function(clearMarkers) {
			manager.showMobileResults();
			manager.redrawMap();

			// now set the map to show the appropriate location
			if (map.currPlace.geometry.viewport) {
				map.el.fitBounds(map.currPlace.geometry.viewport);
				// map.el.setCenter(map.currPlace.geometry.location);
				// map.el.setZoom(10);
			} else {
				map.el.setCenter(map.currPlace.geometry.location);
				map.el.setZoom(17);
			}

			map.enableDetectZoomBoundsChange();

			// this function does the job of trimming the list for us, if there's > MAX_HOTSPOTS
			manager.visibleHotspots    = map.addMarkers({ searchType: manager.searchType, clearMarkers: clearMarkers });
			manager.numVisibleHotspots = manager.visibleHotspots.length;

			if (manager.currViewportMode === 'desktop') {
				manager.displayHotspots();
				manager.getAllHotspotObservations();
			} else {
				if (manager.numVisibleHotspots > 0) {
					manager.currMobilePage = 'results';
					manager.displayHotspots();
					manager.getAllHotspotObservations();
				} else {
					$('#mobileNoResultsFound').modal();
				}
			}
		},

		/**
		 * Loop through all hotspots returned and if we don't have the 'all observation' data already loaded for it, 
		 * fire off an Ajax request for it.
		 */
		getAllHotspotObservations: function() {
			var recencyKey = manager.observationRecency + 'day';

			var hasAtLeastOneRequest = false;
			for (var i=0; i<manager.numVisibleHotspots; i++) {
				var currLocationID = manager.visibleHotspots[i];

				// check allHotspots to see if this data has been loaded yet. If not, prep the object. To reduce
				// server requests, we intelligently categorize all sightings in the appropriate pocket (1day, 2day
				// etc.) That way, if the user does a search for 30 days then reduces the recency setting, we don't
				// need any superfluous requests. If a request for 30 days goes through, ALL properties
				// have their available property set to true
				if (!manager.allHotspots[currLocationID].hasOwnProperty('observations')) {
					manager.allHotspots[currLocationID].isDisplayed = false;
				}

				// if we already have the hotspot data available, just update the sidebar table
				if (manager.allHotspots[currLocationID].observations[manager.searchType][recencyKey].available) {
					manager.updateVisibleLocationInfo(currLocationID);
				} else {
					manager.getSingleHotspotObservations(currLocationID);
					hasAtLeastOneRequest = true;
				}
			}

			// if we didn't just put through a new request, the user just searched a subset of what's already been loaded.
			// update the 
			if (!hasAtLeastOneRequest) {
				manager.updateSpeciesData();
				manager.updateSpeciesTab();

				// let the tablesort know to re-parse the hotspot table
				$('#hotspotTable').trigger("update").trigger("appendCache");
				manager.stopLoading();
			}
		},

		getSingleHotspotObservations: function(locationID) {
			$.ajax({
				url: "ajax/getHotspotObservations.php",
				data: {
					locationID: locationID,
					recency: manager.observationRecency
				},
				type: "POST",
				dataType: "json",
				success: function(response) {
					manager.onSuccessReturnLocationObservations(locationID, response);
				},
				error: function(response) {
					manager.onErrorReturnLocationObservations(locationID, response);
				}
			});
		},

		/**
		 * Returns the observations reports for a single location at a given interval (last 2 days, last 30 days
		 * etc). This can be called multiple times for a single location if the user keeps increasing the recency
		 * range upwards. Once the user's returned data for a location for 30 days, it contains everything it needs
		 * so no new requests are required.
		 */
		onSuccessReturnLocationObservations: function(locationID, response) {
			manager.allHotspots[locationID].isDisplayed = true;
			manager.allHotspots[locationID].observations.success = true;

			// by reference, of course. Changes to this actually change manager.allHotspots. This is just for brevity
			var locationObj = manager.allHotspots[locationID].observations[manager.searchType];

			// mark the information as now available for this observation recency + and anything below,
			// and reset the observation data (it's about to be updated below)
			switch (manager.observationRecency) {
				case 30:
					locationObj['30day'] = { available: true, data: [], numSpecies: 0, numSpeciesRunningTotal: 0 };
				case 25:
					locationObj['25day'] = { available: true, data: [], numSpecies: 0, numSpeciesRunningTotal: 0 };
				case 20:
					locationObj['20day'] = { available: true, data: [], numSpecies: 0, numSpeciesRunningTotal: 0 };
				case 15:
					locationObj['15day'] = { available: true, data: [], numSpecies: 0, numSpeciesRunningTotal: 0 };
				case 10:
					locationObj['10day'] = { available: true, data: [], numSpecies: 0, numSpeciesRunningTotal: 0 };
				case 7:
					locationObj['7day'] = { available: true, data: [], numSpecies: 0, numSpeciesRunningTotal: 0 };
				case 6:
					locationObj['6day'] = { available: true, data: [], numSpecies: 0, numSpeciesRunningTotal: 0 };
				case 5:
					locationObj['5day'] = { available: true, data: [], numSpecies: 0, numSpeciesRunningTotal: 0 };
				case 4:
					locationObj['4day'] = { available: true, data: [], numSpecies: 0, numSpeciesRunningTotal: 0 };
				case 3:
					locationObj['3day'] = { available: true, data: [], numSpecies: 0, numSpeciesRunningTotal: 0 };
				case 2:
					locationObj['2day'] = { available: true, data: [], numSpecies: 0, numSpeciesRunningTotal: 0 };
				case 1:
					locationObj['1day'] = { available: true, data: [], numSpecies: 0, numSpeciesRunningTotal: 0 };
					break;
				default:
					break;
			}

			// now for the exciting part: loop through the observations and put them in the appropriate spot
			// in the data structure
			var speciesCount = response.length;
			for (var i=0; i<speciesCount; i++) {
				var observationTime = parseInt(moment(response[i].obsDt, 'YYYY-MM-DD HH:mm').format('X'), 10);
				var difference = manager.CURRENT_SERVER_TIME - observationTime;
				var daysAgo = Math.ceil(difference / manager.ONE_DAY_IN_SECONDS);

				if (daysAgo >= 30) {
					locationObj['30day'].data.push(response[i]);
				} else if (daysAgo >= 25) {
					locationObj['25day'].data.push(response[i]);
				} else if (daysAgo >= 20) {
					locationObj['20day'].data.push(response[i]);
				} else if (daysAgo >= 15) {
					locationObj['15day'].data.push(response[i]);
				} else if (daysAgo >= 10) {
					locationObj['10day'].data.push(response[i]);
				} else if (daysAgo >= 7) {
					locationObj['7day'].data.push(response[i]);
				} else if (daysAgo >= 6) {
					locationObj['6day'].data.push(response[i]);
				} else if (daysAgo >= 5) {
					locationObj['5day'].data.push(response[i]);
				} else if (daysAgo >= 4) {
					locationObj['4day'].data.push(response[i]);
				} else if (daysAgo >= 3) {
					locationObj['3day'].data.push(response[i]);
				} else if (daysAgo >= 2) {
					locationObj['2day'].data.push(response[i]);
				} else {
					locationObj['1day'].data.push(response[i]);
				}
			}

			// we've added all the observation data, set the numSpecies counts
			for (var key in locationObj) {
				locationObj[key].numSpecies = locationObj[key].data.length;
			}

			// now add the numSpeciesRunningTotal property. This is the running total seen in that time 
			// range: e.g. 3 days would include the total species seen in that day, and 2 days and 1 day

			var days = manager.SEARCH_DAYS.length;
			var uniqueSpecies = {};
			var numUniqueSpecies = 0;
			for (var i=0; i<days; i++) {
				var currDay = manager.SEARCH_DAYS[i];
				var observations = manager.allHotspots[locationID].observations[manager.searchType][currDay + 'day'].data;
				for (var j=0; j<observations.length; j++) {
					if (!uniqueSpecies.hasOwnProperty(observations[j].sciName)) {
						uniqueSpecies[observations[j].sciName] = null;
						numUniqueSpecies++;
					}
				}
				manager.allHotspots[locationID].observations[manager.searchType][currDay + 'day'].numSpeciesRunningTotal = numUniqueSpecies;
			}

			manager.updateVisibleLocationInfo(locationID, response.length);

			if (manager.checkAllObservationsLoaded()) {
				manager.updateSpeciesData();
				manager.updateSpeciesTab();

				// let the tablesort know to re-parse the hotspot table
				$('#hotspotTable').trigger("update").trigger("appendCache");
				manager.stopLoading();
			}
		},

		onErrorReturnLocationObservations: function(locationID, response) {
			manager.allHotspots[locationID].observations.success = false;
			if (manager.checkAllObservationsLoaded()) {
				manager.stopLoading();
			}
		},

		/**
		 * Helper function to update the location's row in the sidebar table and the map modal.
		 */
		updateVisibleLocationInfo: function(locationID, numSpecies) {
			var title = numSpecies + ' bird species seen at this location in the last ' + manager.observationRecency + ' days.';
			var row = $('#location_' + locationID);
			row.removeClass('notLoaded').addClass('loaded');
		},

		/**
		 * Gets called by map-old.js after the markers have been added to the map. This updates the sidebar and
		 * starts requesting the hotspot observation data. This is called any time the map bounds change.
		 */
		displayHotspots: function() {
			if (manager.numVisibleHotspots > 0) {
				var html = manager.generateHotspotTable(manager.visibleHotspots);
				var locationStr = 'location';
				if (manager.numVisibleHotspots > 1) {
					locationStr  = 'locations';
				}

				try {
					$('#hotspotTable').trigger("destroy");
				} catch (e) { }

				var numHotspotsStr = '';
				if (manager.maxHotspotsReached) {
					numHotspotsStr = manager.numVisibleHotspots + '+';
				} else {
					numHotspotsStr = manager.numVisibleHotspots;
				}

				helper.showMessage('<b>' + numHotspotsStr + '</b> ' + locationStr + ' found', 'notification');

				if (manager.currViewportMode === 'desktop') {
					$('#fullPageSearchResults').html(html).removeClass('hidden').fadeIn(300);
				} else {
					$('#locationsTabContent').html(html); //.removeClass('hidden').fadeIn(300);
					$('#locationsTab').removeClass('disabled').html('Locations <span>(' + manager.numVisibleHotspots + ')</span>');
				}
				$('#hotspotTable').tablesorter({
					headers: { 2: { sorter: 'species' } }
				});			
			} else {
				helper.showMessage('No birding locations found', 'notification');
				$('#fullPageSearchResults').fadeOut(300);
				helper.stopLoading();
			}
		},

		/**
		 * Shows the large message section in the left sidebar (desktop only).
		 */
		showMessage: function(message, messageType) {
			if ($('#messageBar').hasClass('visible')) {
				$('#messageBar').removeClass().addClass(messageType + ' visible').html(message); // be nice to add an effect here...
			} else {
				$('#messageBar').css('display', 'none').removeClass().addClass(messageType + ' visible').html(message).fadeIn(300);
			}
		},


		/**
		 * Called any time the selected data changes. This updates the Bird Species tab and tab content.
		 */
		updateSpeciesData: function() {
			manager.speciesInVisibleHotspots = {};
			manager.numSpeciesInVisibleHotspots = 0;

			for (var i=0; i<manager.numVisibleHotspots; i++) {
				var currLocationID = manager.visibleHotspots[i];

				// if this hotspots observations failed to load (for whatever reason), just ignore the row
				if (!manager.allHotspots[currLocationID].observations.success) {
					continue;
				}

				var currLocationSpeciesInfo = manager.getLocationSpeciesList(currLocationID, manager.searchType, manager.observationRecency);
				for (var speciesSciName in currLocationSpeciesInfo.species) {
					var currData = currLocationSpeciesInfo.species[speciesSciName];
					if (!manager.speciesInVisibleHotspots.hasOwnProperty(speciesSciName)) {
						manager.speciesInVisibleHotspots[speciesSciName] = {
							comName: currData.comName,
							sciName: speciesSciName,
							obs: []
						};
						manager.numSpeciesInVisibleHotspots++;
					}

					manager.speciesInVisibleHotspots[speciesSciName].obs.push({
						howMany: currData.howMany,
						lat: currData.lat,
						lng: currData.lng,
						locID: currData.locID,
						locName: currData.locName,
						obsDt: currData.obsDt,
						obsReviewed: currData.obsReviewed,
						obsValid: currData.obsValid
					});
				}
			}
		},

		onClickSelectTab: function(e) {
			var tab = e.target;
			if ($(tab).hasClass('disabled')) {
				return;
			}
			var tabID = $(tab).attr("id");
			manager.selectTab(tabID);
		},

		selectTab: function(tabID) {
			if (tabID == manager.currTabID) {
				return;
			}

			$('#panelTabs li').removeClass('selected');
			$('#' + tabID).addClass('selected');
			$('#' + manager.currTabID + 'Content').addClass('hidden');
			$('#' + tabID + 'Content').removeClass('hidden');

			if (tabID == 'mapTab') {
				manager.redrawMap();
			}

			manager.currTabID = tabID;
		},

		toggleAllCheckedHotspots: function(e) {
			var isChecked = e.target.checked;
			if (isChecked) {
				$('#hotspotTable tbody input').each(function() {
					this.checked = true;
				});
			} else {
				$('#hotspotTable tbody input').removeAttr('checked');
			}

			// loop through all markers and enable/disable them
			for (var i in map.markers) {
				map.markers[i].setVisible(isChecked);
			}

			for (var j=0; j<manager.numVisibleHotspots; j++) {
				var currLocationID = manager.visibleHotspots[j];
				manager.allHotspots[currLocationID].isDisplayed = isChecked;
			}

			manager.updateSpeciesTab();
		},

		/**
		 * Called when the user checks/unchecks a single hotspot location table in the left sidebar.
		 */
		toggleSingleCheckedHotspot: function(e) {
			var row = $(e.target).closest('tr');
			var locationID = $(row).attr('id').replace(/location_/, '');

			var isChecked = e.target.checked;
			manager.allHotspots[locationID].isDisplayed = isChecked;

			// a bit fussy, but ensure the top "toggle all" checkbox is checked/unchecked, depending on what's there
			if (!isChecked) {
				$('#hotspotTable thead .toggle').removeAttr('checked');
			} else {
				var allLocationsChecked = true;
				var cbs = $('#hotspotTable tbody input');
				for (var i=0; i<cbs.length; i++) {
					if (!cbs[i].checked) {
						allLocationsChecked = false;
						break;
					}
				}
				if (allLocationsChecked) {
					$('#hotspotTable thead .toggle')[0].checked = true;
				} else {
					$('#hotspotTable thead .toggle').removeAttr('checked');
				}
			}

			// now update the map and Bird Species tab
			map.markers[locationID].setVisible(isChecked);
			manager.updateSpeciesTab();
		},


		// this should really be templated...!
		generateHotspotTable: function(visibleHotspots) {
			var html = '<table class="tablesorter tablesorter-bootstrap table table-bordered table-striped" id="hotspotTable">' +
					'<thead>' +
					'<tr>' +
						'<th width="20" class="{ sorter: false }"><input type="checkbox" class="toggle" checked="checked" title="Select / Unselect all" /></th>' +
						'<th>LOCATION</th>' +
						'<th class="sorter-species" width="40">SPECIES</th>' +
					'</tr>' +
					'</thead>' +
					'<tbody>';

			for (var i=0; i<visibleHotspots.length; i++) {
				var currLocationID = visibleHotspots[i];
				var rowClass = '';
				var checkedAttr = '';

				if (manager.allHotspots[currLocationID].isDisplayed) {
					rowClass = '';
					checkedAttr = 'checked="checked"';
				}
				var numSpeciesWithinRange = '';
				if (!manager.allHotspots[currLocationID].hasOwnProperty('observations')) {
					rowClass = ' notLoaded';
					checkedAttr = 'checked="checked"';
				} else {
					numSpeciesWithinRange = manager.allHotspots[currLocationID].observations[manager.searchType][manager.observationRecency + 'day'].numSpeciesRunningTotal;
				}

				html += '<tr id="location_' + currLocationID + '">' +
						'<td><input type="checkbox" id="row' + i + '" ' + checkedAttr + ' /></td>' +
						'<td class="loadingStatus' + rowClass + '">' + '<label for="row' + i + '">' + manager.allHotspots[currLocationID].n + '</label></td>' +
						'<td class="sp"><span class="speciesCount">' + numSpeciesWithinRange + '</span></td>' +
						'</tr>';
			}
			html += '</tbody></table>';

			return html;
		},

		generateSpeciesTable: function() {
			var chr = '';
			if (manager.birdSpeciesLocationDetailsExpanded) {
				chr = '-';
			} else {
				chr = '+';
			}

			var html = '';
			var dateFormat = '';
			if (manager.currViewportMode === 'desktop') {
				html = '<table class="tablesorter-bootstrap" cellpadding="2" cellspacing="0" id="speciesTable">' +
						'<thead>' +
						'<tr>' +
							'<th>Species Name</th>' +
							'<th>Scientific Name</th>' +
							'<th class="{ sorter: false }">Locations&nbsp;Seen&nbsp;<a href="#" class="toggleBirdSpeciesLocations">(' + chr + ')</a></th>' +
							'<th width="110" nowrap>Last Seen</th>' +
							'<th nowrap># Reported</th>' +
						'</tr>' +
						'</thead><tbody>';
				dateFormat = 'MMM Do, h:mm a';
			} else {
				html = '<table class="tablesorter-bootstrap" cellpadding="2" cellspacing="0" id="speciesTable">' +
						'<thead>' +
						'<tr>' +
							'<th>Species</th>' +
							'<th>Locations&nbsp;<a href="#" class="toggleBirdSpeciesLocations">(' + chr + ')</a></th>' +
							'<th nowrap>Last Seen</th>' +
						'</tr>' +
						'</thead><tbody>';
				dateFormat = 'MMM D, h:mma';
			}

			var speciesCount = 0;
			for (var i in manager.speciesInVisibleHotspots) {
				var locations = [];
				var lastSeen = [];
				var observationsInVisibleLocation = [];

				var lastObservation = 0;
				for (var j=0; j<manager.speciesInVisibleHotspots[i].obs.length; j++) {
					var currLocationID = manager.speciesInVisibleHotspots[i].obs[j].locID;
					var observationTime = moment(manager.speciesInVisibleHotspots[i].obs[j].obsDt, 'YYYY-MM-DD HH:mm').format(dateFormat);

					var observationTimeUnix = parseInt(moment(manager.speciesInVisibleHotspots[i].obs[j].obsDt, 'YYYY-MM-DD HH:mm').format('X'), 10);
					if (observationTimeUnix > lastObservation) {
						lastObservation = observationTimeUnix;
					}

					if (!manager.allHotspots[currLocationID].isDisplayed) {
						locations.push('<div class="lightGrey">' + manager.speciesInVisibleHotspots[i].obs[j].locName + '</div>');
						lastSeen.push('<div class="lightGrey">' + observationTime + '</div>');
						continue;
					}
					observationsInVisibleLocation.push(manager.speciesInVisibleHotspots[i].obs[j]);
					locations.push('<div>' + manager.speciesInVisibleHotspots[i].obs[j].locName + '</div>');
					lastSeen.push('<div>' + observationTime + '</div>');
				}

				if (observationsInVisibleLocation.length === 0)  {
					continue;
				}

				// generate the Locations cell content
				var locationStr = 'locations';
				if (locations.length == 1) {
					locationStr = 'location';
				}


				var locationsHTML = '';
				if (manager.currViewportMode == 'desktop') {
					locationsHTML = 'Seen at ' + locations.length + ' ' + locationStr + ' <a href="#" class="toggleBirdSpeciesLocations">(' + chr + ')</a>';
				} else {
					locationsHTML = locations.length + ' ' + locationStr + ' <a href="#" class="toggleBirdSpeciesLocations">(' + chr + ')</a>';
				}

				if (manager.birdSpeciesLocationDetailsExpanded) {
					locationsHTML += '<div class="birdLocations">' + locations.join('\n') + '</div>';
				} else {
					locationsHTML += '<div class="hidden birdLocations">' + locations.join('\n') + '</div>';
				}

				// generate the Last Seen cell content
				var lastObservationFormatted = moment.unix(lastObservation).format(dateFormat);
				var lastSeenHTML = '';
				if (manager.birdSpeciesLocationDetailsExpanded) {
					lastSeenHTML = '<div class="lastSeenSingle" style="visibility: hidden">' + lastObservationFormatted + '</div>' +
						'<div class="lastSeenDetails">' + lastSeen.join('\n') + '</div>';
				} else {
					lastSeenHTML = '<div class="lastSeenSingle">' + lastObservationFormatted + '</div>' +
						'<div class="hidden lastSeenDetails">' + lastSeen.join('\n') + '</div>';
				}

				var howManyCount = null;
				for (var k=0; k<observationsInVisibleLocation.length; k++) {
					var howMany = observationsInVisibleLocation[k].howMany || "-";
					if (howMany.toString().match(/\D/g)) {
						howManyCount = "-";
						break;
					}
					howManyCount += parseInt(observationsInVisibleLocation[k].howMany, 10);
				}

				if (manager.currViewportMode === 'desktop') {
					html += '<tr>' +
						'<td>' + manager.speciesInVisibleHotspots[i].comName + '</td>' +
						'<td>' + manager.speciesInVisibleHotspots[i].sciName + '</td>' +
						'<td>' + locationsHTML + '</td>' +
						'<td>' + lastSeenHTML + '</td>' +
						'<td>' + howManyCount + '</td>' +
					'</tr>';
				} else {
					html += '<tr>' +
						'<td>' + manager.speciesInVisibleHotspots[i].comName + '</td>' +
						'<td>' + locationsHTML + '</td>' +
						'<td>' + lastSeenHTML + '</td>' +
					'</tr>';
				}

				speciesCount++;
			}
			html += '</tbody></table>';


			if (speciesCount === 0) {
				html = '<p>Yegads, no birds found!</p>';
			} else {
				var selectedHotspots = manager.getSelectedHotspots();
				var introPara = '';

				var durationStr = '';
				if (manager.observationRecency == 1) {
					durationStr = 'day';
				} else {
					durationStr = manager.observationRecency + ' days';
				}
				if (selectedHotspots.length == 1) {
					var locationName = manager.allHotspots[selectedHotspots[0]].n;
					introPara = '<p>In the last <b>' + durationStr + '</b>, there have been <b>' + speciesCount + '</b> species reported at <b>' + locationName + '</b>.</p>';
				} else {
					var numLocations = selectedHotspots.length;

					if (manager.currViewportMode == "desktop") {
						introPara = '<p>In the last <b>' + durationStr + '</b>, there have been <b>' + speciesCount + '</b> species sighted at the <b>' + numLocations + '</b> locations selected.</p>';
					} else {
						introPara = '<p>In the last <b>' + durationStr + '</b>, there have been <b>' + speciesCount + '</b> species sighted at the <b>' + numLocations + '</b> visible locations.</p>';
					}
				}

				html = introPara + '<hr size="1" />' + html;
			}

			manager.numVisibleSpecies = speciesCount;

			return html;
		},

		updateSpeciesTab: function() {
			try {
				$("#speciesTable").trigger("destroy");
			} catch (e) {

			}

			$('#birdSpeciesTable').html(manager.generateSpeciesTable());
			$('#birdSpeciesTab').removeClass('disabled').html('Bird Species <span>(' + manager.numVisibleSpecies + ')</span>');

			$("#speciesTable").tablesorter({
				theme: 'bootstrap',
				headerTemplate: '{content} {icon}',
				widgets: ['zebra', 'columns', 'uitheme']
			});

			// now assign the evernt handler for the header's (-) / (+) option. We need to do directly target the element 
			// instead of event delegating it because we want to prevent the tablesort event
			$('#birdSpeciesTable th .toggleBirdSpeciesLocations').on('mouseup', manager.onMouseUpToggleAllBirdSpeciesLocation);
		},

		displaySingleHotspotBirdSpecies: function(e) {
			e.preventDefault();
			var locationID = $(e.target).data('location');

			// unselect all hotspot locations except for the one chosen
			$('#hotspotTable input').removeAttr('checked');

			// should definitely be moved to helper!
			for (var i in map.markers) {
				if (locationID != i) {
					map.markers[i].setVisible(false);
				}
			}

			for (var currLocationID in manager.allHotspots) {
				if (currLocationID === locationID) {
					manager.allHotspots[currLocationID].isDisplayed = true;
				} else {
					manager.allHotspots[currLocationID].isDisplayed = false;
				}
			}

			$('#location_' + locationID + ' input')[0].checked = true;

			// now update the species tab and redirect the user to it
			manager.updateSpeciesTab();
			manager.selectTab('birdSpeciesTab');
		},

		/**
		 * Called after any observations has been returned. It looks through all of data.hotspots
		 * and confirms every one has an observations property (they are added after a response - success
		 * or failure).
		 */
		checkAllObservationsLoaded: function() {
			var allLoaded = true;
			for (var i=0; i<manager.numVisibleHotspots; i++) {
				var currLocationID = manager.visibleHotspots[i];

				// if any of the visible hotspots haven't had a success/fail message for their observation
				// list, we ain't done
				if (manager.allHotspots[currLocationID].observations.success === null) {
					allLoaded = false;
					break;
				}
			}

			return allLoaded;
		},

		getLocationSpeciesList: function(locationID, searchType, recency) {
			if (!manager.allHotspots.hasOwnProperty(locationID)) {
				return false;
			}
			var startIndex = $.inArray(recency, manager.SEARCH_DAYS);

			var species = {};
			var numSpecies = 0;
			for (var i=startIndex; i>=0; i--) {
				var currDay = manager.SEARCH_DAYS[i];
				var observations = manager.allHotspots[locationID].observations[searchType][currDay + 'day'].data;

				for (var j=0; j<observations.length; j++) {
					if (!species.hasOwnProperty(observations[j].sciName)) {
						species[observations[j].sciName] = observations[j];
						numSpecies++;
					}
				}
			}

			return {
				numSpecies: numSpecies,
				species: species
			};
		},


		// blurgh. Why parse the DOM when we could pull from allHotspots?
		getSelectedHotspots: function() {
			var selectedHotspots = [];
			var cbs = $('#hotspotTable tbody input');
			for (var i=0; i<cbs.length; i++) {
				if (cbs[i].checked) {
					selectedHotspots.push($(cbs[i]).closest('tr').attr('id').replace(/^location_/, ''));
				}
			}
			return selectedHotspots;
		},


		showSearchPage: function() {
			$('#messageBar').addClass('hidden');
			$('body').removeClass('viewingResults');
			manager.currMobilePage = 'search';
		},

		showMobileResults: function() {
			$('body').addClass('viewingResults');
			manager.currMobilePage = 'results';
		},

		/**
		 * Called when the user switches from one mode (desktop / mobile) to another. It ensures the 
		 * appropriate page elements are re-created. 
		 */
		convertPagetoMode: function(mode) {
			if (mode == 'desktop') {

			} else if (mode == 'mobilePortrait') {
					// currMobilePage: 'search', // search / results

			} else if (mode == 'mobileLandscape') {

			}
		},

		/**
		 * Helper function. Called after a new hotspot has been returned from an all/notable search. It updates
		 * the data structure to be ready for storage of the upcoming observation data.
		 */
		prepareHotspotDataStructure: function(locationID) {
			manager.allHotspots[locationID].observations = {
				success: null,
				all: {
					'1day': { available: false, data: [], numSpecies: 0 },
					'2day': { available: false, data: [], numSpecies: 0 },
					'3day': { available: false, data: [], numSpecies: 0 },
					'4day': { available: false, data: [], numSpecies: 0 },
					'5day': { available: false, data: [], numSpecies: 0 },
					'6day': { available: false, data: [], numSpecies: 0 },
					'7day': { available: false, data: [], numSpecies: 0 },
					'10day': { available: false, data: [], numSpecies: 0 },
					'15day': { available: false, data: [], numSpecies: 0 },
					'20day': { available: false, data: [], numSpecies: 0 },
					'25day': { available: false, data: [], numSpecies: 0 },
					'30day': { available: false, data: [], numSpecies: 0 }
				},
				notable: {
					'1day': { available: false, data: [], numSpecies: 0 },
					'2day': { available: false, data: [], numSpecies: 0 },
					'3day': { available: false, data: [], numSpecies: 0 },
					'4day': { available: false, data: [], numSpecies: 0 },
					'5day': { available: false, data: [], numSpecies: 0 },
					'6day': { available: false, data: [], numSpecies: 0 },
					'7day': { available: false, data: [], numSpecies: 0 },
					'10day': { available: false, data: [], numSpecies: 0 },
					'15day': { available: false, data: [], numSpecies: 0 },
					'20day': { available: false, data: [], numSpecies: 0 },
					'25day': { available: false, data: [], numSpecies: 0 },
					'30day': { available: false, data: [], numSpecies: 0 }
				}
			};
		}
	};


	var _getSearchType = function() {
		return _searchType;
	};

	var _getSearchFieldElement = function() {
		return _searchField;
	};

	var _hasActiveHotspotRequest = function() {
		return _activeHotspotRequest;
	};

	var _onMapBoundaryUpdate = function(visibleHotspots) {
		manager.visibleHotspots = visibleHotspots;
		manager.numVisibleHotspots = manager.visibleHotspots.length;
		manager.displayHotspots();
		manager.getAllHotspotObservations();
	};


	// move to separate file
	$.tablesorter.addParser({
		id: 'species',
		is: function() {
			return false;
		},
		format: function(s, table, cell) {
			return $(cell).find('span').text();
		},
		type: 'numeric'
	});


	// our public API
	return {
		init: _init,
		getSearchType: _getSearchType,
		getSearchFieldElement: _getSearchFieldElement,
		hasActiveHotspotRequest: _hasActiveHotspotRequest,
		onMapBoundaryUpdate: _onMapBoundaryUpdate
	};
});
