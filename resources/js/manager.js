/*jslint browser:true*/
/*global $:false,map:false,google:false,console:false,moment:false*/
'use strict';

var manager = {

	// tracks the main hotspot searches to prevent unnecessary duplicates
	hotspotSearches: {},

	// hotspots currently visible in the map viewport. Array of location ID. The actual hotspot data
	// is stored in allHotspots
	visibleHotspots: [],
	numVisibleHotspots: null,

	// all hotspot results for a region. This just keeps getting appended to as the user does new
	// searches, drags/zooms the map. Unlikely it would get TOO massive in a single session,
	// plus it lets us be nice to eBird's servers and not re-request the same data multiple times.
	// This is cached in local storage to again minimize requests
	allHotspots: {},

	// keeps track of all species currently in the visible subset of hotspots
	speciesInVisibleHotspots: {},
	numSpeciesInVisibleHotspots: 0,

	regionType: null,
	region: null,
	observationRecency: null,
	searchType: null, // all, notable
	searchField: null,
	activeHotspotRequest: false,
	currTabID: 'mapTab',
	currentHoveredRowLocationID: null,
	maxHotspotsReached: false,

	// some constants
	CURRENT_SERVER_TIME: null,
	ONE_DAY_IN_SECONDS: 24 * 60 * 60,
	MAX_HOTSPOTS: 50,
	SEARCH_DAYS: [1,2,3,4,5,6,7,10,15,20,25,30],
	LOCAL_STORAGE_DURATION: 60 * 60 * 12, // 12 hours


	init: function() {
		$(window).resize(manager.handleWindowResize);

		$('#aboutLink').on('click', function(e) {
			e.preventDefault();
			$('#about').modal();
		});
		$('#featureSuggestionsLink').on('click', function(e) {
			e.preventDefault();
			$('#featureSuggestions').modal();
		});


		// make a note of some important DOM elements
		manager.searchField = $('#searchTextField')[0];

		// make a note of the current server time. This is used to ensure date calculations don't go
		// wonky if the user's system clock is off
		manager.CURRENT_SERVER_TIME = parseInt($('body').data('serverdatetime'), 10);

		// prep the page elements to ensure they're the right size
		manager.handleWindowResize();

		// add the appropriate event handlers to detect when the search settings have changed
		manager.addEventHandlers();

		// set the default values
		manager.observationRecency = parseInt($('#observationRecency').val(), 10);
		manager.searchType         = $('#resultType').val();

		// initialize the map
		map.initialize();

		// focus!
		$(manager.searchField).focus();
	},

	addEventHandlers: function() {
		$('#observationRecency').bind('change', manager.onChangeObservationRecency);
		$('#panelTabs').on('click', 'li', manager.onClickSelectTab);
		$('#searchResults').on('click', '.toggle', manager.toggleCheckedHotspots);
		$('#searchResults').on('click', 'tbody input', manager.toggleHotspot);
		$('#searchResults').on('mouseover', 'tbody tr', manager.onHoverHotspotRow);
		$('#searchResults').on('mouseout', 'tbody tr', manager.onHoverOutHotspotRow);
		$(document).on('click', '.viewLocationBirds', manager.displaySingleHotspotBirdSpecies);
	},

	onChangeObservationRecency: function(e) {
		manager.observationRecency = parseInt($(e.target).val(), 10);
		var address = $.trim(manager.searchField.value);
		if (address !== '') {
			manager.getHotspots();
		}
	},

	onHoverHotspotRow: function(e) {
		var id = $(e.currentTarget).attr('id');
		if (id) {
			var locationID = id.replace(/^location_/, '');
			map.markers[locationID].setIcon('resources/images/marker2.png');

			//var zIndex = map.markers[locationID].getZIndex();
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
	 * Retrieves all hotspots for a region.
	 */
	getHotspots: function() {

		// if a hotspot search for this regionType, region and <= recency has already been made, don't bother doing another.
		// We can safely do this because the original request will retrieve ALL locations, just not request their observations
		// (a far more weighty request load) if they're not in the viewport
		var searchKey = manager.regionType + '--' + manager.region;
		if (manager.hotspotSearches.hasOwnProperty(searchKey)) {
			if (manager.observationRecency <= manager.hotspotSearches[searchKey].recency) {
				map.clear();

				// this function does the job of trimming the list for us, if there are > MAX_HOTSPOTS
				manager.visibleHotspots = map.addMarkersInRangeAndRecency();
				manager.numVisibleHotspots = manager.visibleHotspots.length;
				manager.displayHotspots();
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
							manager.allHotspots[locationID] = response[i];
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
	 */
	updatePage: function(clearMarkers) {

		// this function does the job of trimming the list for us, if there's > MAX_HOTSPOTS
		manager.visibleHotspots = map.addMarkersAndReturnVisible(clearMarkers);
		manager.numVisibleHotspots = manager.visibleHotspots.length;

		manager.displayHotspots();
	},

	/**
	 * Loop through all hotspots returned and if we don't have data already loaded for it, fire off an Ajax
	 * request for it.
	 */
	getAllHotspotObservations: function() {
		var recencyKey = manager.observationRecency + 'day';

		for (var i=0; i<manager.numVisibleHotspots; i++) {
			var currLocationID = manager.visibleHotspots[i];

			// check allHotspots to see if this data has been loaded yet. If not, prep the object. To reduce
			// server requests, we intelligently categorize all sightings in the appropriate pocket (1day, 2day
			// etc.) That way, if the user does a search for 30 days then reduces the recency setting, we don't
			// need any superfluous requests. If a request for 30 days goes through, ALL properties
			// have their available property set to true
			if (!manager.allHotspots[currLocationID].hasOwnProperty('observations')) {
				manager.allHotspots[currLocationID].isDisplayed = false;
				manager.allHotspots[currLocationID].observations = {
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

			// if we already have the hotspot data available, just update the table
			if (manager.allHotspots[currLocationID].observations[manager.searchType][recencyKey].available) {
				manager.updateVisibleLocationInfo(currLocationID);
			} else {
				manager.getSingleHotspotObservations(currLocationID);
			}
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

		if (numSpecies > 0) {
			row.find('.speciesCount').html(numSpecies).attr('title', title);
			//$('#iw_' + locationID + ' .viewLocationBirds').append(' <b>' + numSpecies + '</b>');

			map.infoWindows[locationID].setContent("chicken");
		}
	},

	/**
	 * Gets called by map.js after the markers have been added to the map. This updates the sidebar and
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

			manager.showMessage('<b>' + numHotspotsStr + '</b> ' + locationStr + ' found', 'notification');
			$('#searchResults').html(html).removeClass('hidden').fadeIn(300);
			$('#hotspotTable').tablesorter({
				headers: { 2: { sorter: 'species' } }
			});

			// now start requesting all the observation data for each hotspot
			manager.getAllHotspotObservations();
		} else {
			manager.showMessage('No birding locations found', 'notification');
			$('#searchResults').fadeOut(300);
			manager.stopLoading();
		}
	},

	showMessage: function(message, messageType) {
		if ($('#messageBar').hasClass('visible')) {
			$('#messageBar').removeClass().addClass(messageType + ' visible').html(message); // be nice to add an effect here...
		} else {
			$('#messageBar').css('display', 'none').removeClass().addClass(messageType + ' visible').html(message).fadeIn(300);
		}
	},

	updateSpeciesData: function() {
		manager.numSpeciesInVisibleHotspots = 0;

		for (var i=0; i<manager.numVisibleHotspots; i++) {
			var currLocationID = manager.visibleHotspots[i];

			// if this hotspots observations failed to load (for whatever reason), just ignore the row
			if (!manager.allHotspots[currLocationID].observations.success) {
				continue;
			}

			for (var daysAgo in manager.allHotspots[currLocationID].observations) {
				var currGroup = manager.allHotspots[currLocationID].observations[daysAgo];

				// if the observation data for this recency group (25 days, or whatever) hasn't been loaded
				// yet, forgetaboudit!
				if (!currGroup.available) {
					continue;
				}

				for (var j=0; j<currGroup.data.length; j++) {
					var currData = currGroup.data[j];
					var sciName  = currData.sciName;

					if (!manager.allSpecies.hasOwnProperty(sciName)) {
						manager.allSpecies[sciName] = {
							comName: currData.comName,
							sciName: currData.sciName,
							obs: []
						};
						manager.numSpeciesInVisibleHotspots++;
					}

					manager.allSpecies[sciName].obs.push({
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

		manager.currTabID = tabID;
	},

	toggleCheckedHotspots: function(e) {
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

	toggleHotspot: function(e) {
		var row = $(e.target).closest('tr');
		var locationID = $(row).attr('id').replace(/location_/, '');

		var isChecked = e.target.checked;
		manager.allHotspots[locationID].isDisplayed = isChecked;

		// now update the map and Bird Species tab
		map.markers[locationID].setVisible(isChecked);
		manager.updateSpeciesTab();
	},


	// ------------------------------------------

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
						'<td class="loadingStatus' + rowClass + '"><label for="row' + i + '">' + manager.allHotspots[currLocationID].n + '</label></td>' +
						'<td class="sp"><span class="speciesCount">' + numSpeciesWithinRange + '</span></td>' +
					'</tr>';
		}
		html += '</tbody></table>';

		return html;
	},

	generateSpeciesTable: function() {
		var html = '<table class="tablesorter-bootstrap" cellpadding="2" cellspacing="0" id="speciesTable">' +
				'<thead>' +
				'<tr>' +
					'<th>Species Name</th>' +
					'<th>Scientific Name</th>' +
					'<th class="{ sorter: false }">Locations seen</th>' +
					'<th width="110" nowrap>Last seen</th>' +
					'<th nowrap># reported</th>' +
				'</tr>' +
				'</thead><tbody>';

		var speciesCount = 0;
		for (var i in manager.species) {
			var locations = [];
			var lastSeen = [];
			var observationsInVisibleLocation = [];

			for (var j=0; j<manager.species[i].obs.length; j++) {
				var currLocationID = manager.species[i].obs[j].locID;
				var observationTime = moment(manager.species[i].obs[j].obsDt, 'YYYY-MM-DD HH:mm').format('MMM Do, H:mm a');

				if (!manager.allHotspots[currLocationID].isDisplayed) {
					locations.push('<div class="lightGrey">' + manager.species[i].obs[j].locName + '</div>');
					lastSeen.push('<div class="lightGrey">' + observationTime + '</div>');
					continue;
				}
				observationsInVisibleLocation.push(manager.species[i].obs[j]);
				locations.push('<div>' + manager.species[i].obs[j].locName + '</div>');
				lastSeen.push('<div>' + observationTime + '</div>');
			}

			if (observationsInVisibleLocation.length === 0)  {
				continue;
			}

			var locationsHTML = locations.join('\n');
			var lastSeenHTML  = lastSeen.join('\n');

			var howManyCount = null;
			for (var k=0; k<observationsInVisibleLocation.length; k++) {
				var howMany = observationsInVisibleLocation[k].howMany || "-";
				if (howMany.toString().match(/\D/g)) {
					howManyCount = "-";
					break;
				}
				howManyCount += parseInt(observationsInVisibleLocation[k].howMany, 10);
			}

			html += '<tr>' +
				'<td>' + manager.species[i].comName + '</td>' +
				'<td>' + manager.species[i].sciName + '</td>' +
				'<td>' + locationsHTML + '</td>' +
				'<td>' + lastSeenHTML + '</td>' +
				'<td>' + howManyCount + '</td>' +
			'</tr>';

			speciesCount++;
		}
		html += '</tbody></table>';

		if (speciesCount === 0) {
			html = '<p>Yegads, no birds found!</p>';
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
		$('#birdSpeciesTab').removeClass('disabled').html('Bird Species (' + manager.numVisibleSpecies + ')');

		$("#speciesTable").tablesorter({
			theme: 'bootstrap',
			headerTemplate: '{content} {icon}',
			widgets: ['zebra', 'columns', 'uitheme']
		});
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

	hasAtLeastOneObservationWithinRecency: function(locationID, searchType, recency) {
		if (!manager.allHotspots.hasOwnProperty(locationID)) {
			return false;
		}

		var startIndex = manager.SEARCH_DAYS.indexOf(recency);

		var found = false;
		for (var i=startIndex; i>=0; i--) {
			var currDay = manager.SEARCH_DAYS[i];
			if (manager.allHotspots[locationID].observations[searchType][currDay + 'day'].numSpecies > 0) {
				found = true;
				break;
			}
		}

		return found;
	},

	// sod this. Add a "rangeSpeciesCount" property, which is populated when the data is first returned. No 
	// point wasting CPU cycles recalculating the same damn thing each time
	getNumSpeciesWithinRange: function(locationID, searchType, recency) {
		if (!manager.allHotspots.hasOwnProperty(locationID)) {
			return false;
		}
		var startIndex = manager.SEARCH_DAYS.indexOf(recency);

		var uniqueSpecies = {};
		var numUniqueSpecies = 0;
		for (var i=startIndex; i>=0; i--) {
			var currDay = manager.SEARCH_DAYS[i];
			var observations = manager.allHotspots[locationID].observations[searchType][currDay + 'day'].data;

			for (var j=0; j<observations.length; j++) {
				if (!uniqueSpecies.hasOwnProperty(observations[j].sciName)) {
					uniqueSpecies[observations[j].sciName] = null;
					numUniqueSpecies++;
				}
			}
		}

		return numUniqueSpecies;
	},


	// not the prettiest thing ever, but since flexbox isn't standardized yet...
	handleWindowResize: function() {
		var windowHeight = $(window).height();
		var windowWidth = $(window).width();
		$('#sidebar').css('height', windowHeight - 77);
		$('#mainPanel').css({
			height: windowHeight - 54,
			width: windowWidth - 325
		});
		$('#panelContent').css({
			height: windowHeight - 82
		});
		$('#searchResults').css('height', windowHeight - 330);

		var address = $.trim(manager.searchField.value);
		if (address !== '') {
			manager.updatePage(false);
		}
	},

	startLoading: function() {
		$('#loadingSpinner').fadeIn(200);
	},

	stopLoading: function() {
		$('#loadingSpinner').fadeOut(200);
	}
};


// add parser through the tablesorter addParser method
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



// start 'er up (on DOM ready)
$(manager.init);