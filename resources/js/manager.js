/*jslint browser:true*/
/*global $:false,map:false,console:false,moment:false*/
'use strict';

var manager = {

	// hotspots currently visible in the map viewport. Array of location ID. The actual hotspot data
	// is stored in allHotspots
	visibleHotspots: [],
	numVisibleHotspots: null,

	// all hotspot results for a region. This just keeps getting appended to as the user does new
	// searches, drags/zooms the map. Seems unlikely it would get TOO massive in a single session,
	// plus it lets us be nice to eBirds servers and not re-request the same data multiple times
	allHotspots: {},

	// keeps track of all species currently in the visible subset of hotspots
	speciesInVisibleHotspots: {},
	numSpeciesInVisibleHotspots: 0,


	regionType: null,
	region: null,
	observationRecency: null,
	searchType: null,
	searchField: null,
	activeHotspotRequest: false,
	currTabID: 'mapTab',
	currentHoveredRowLocationID: null,
	maxHotspotsReached: false,
	
	// some constants
	CURRENT_SERVER_TIME: null,
	ONE_DAY_IN_SECONDS: 24 * 60 * 60,
	MAX_HOTSPOTS: 50,


	init: function() {
		$(window).resize(manager.handleWindowResize);

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

	// not the prettiest thing ever, but since flexbox isn't implemented in all browsers yet...
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
			manager.updatePage();
		}
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
				manager.allHotspots[currLocationID] = {
					isDisplayed: false,
					observations: {
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
					}
				};
			}

			// if we already have the hotspot data available, just update the table
			if (manager.allHotspots[currLocationID].observations[manager.searchType][recencyKey].available) {
				manager.updateLocationInfo(currLocationID);
			} else {
				manager.getSingleHotspotObservation(currLocationID);
			}
		}
	},

	getSingleHotspotObservation: function(locationID) {
		$.ajax({
			url: "ajax/getHotspotObservations.php",
			data: {
				locationID: locationID,
				recency: manager.observationRecency
			},
			type: "POST",
			dataType: "json",
			success: function(response) {
				manager.onSuccessReturnObservations(locationID, response);
			},
			error: manager.onErrorReturnObservations
		});
	},

	onSuccessReturnObservations: function(locationID, response) {
		var locationObj = manager.allHotspots[locationID].observations;
		manager.allHotspots[locationID].isDisplayed = true;
		locationObj.success = true;

		switch (manager.observationRecency) {
			case 30:
				locationObj[manager.searchType]['30day'].available = true;
			case 25:
				locationObj[manager.searchType]['25day'].available = true;
			case 20:
				locationObj[manager.searchType]['20day'].available = true;
			case 15:
				locationObj[manager.searchType]['15day'].available = true;
			case 10:
				locationObj[manager.searchType]['10day'].available = true;
			case 7:
				locationObj[manager.searchType]['7day'].available = true;
			case 6:
				locationObj[manager.searchType]['6day'].available = true;
			case 5:
				locationObj[manager.searchType]['5day'].available = true;
			case 4:
				locationObj[manager.searchType]['4day'].available = true;
			case 3:
				locationObj[manager.searchType]['3day'].available = true;
			case 2:
				locationObj[manager.searchType]['2day'].available = true;
			case 1:
				locationObj[manager.searchType]['1day'].available = true;
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

			// 

			if (daysAgo >= 30) {
				locationObj[manager.searchType]['30day'].data.push(response[i]);
			} else if (daysAgo >= 25) {
				locationObj[manager.searchType]['25day'].data.push(response[i]);
			} else if (daysAgo >= 20) {
				locationObj[manager.searchType]['20day'].data.push(response[i]);
			} else if (daysAgo >= 15) {
				locationObj[manager.searchType]['15day'].data.push(response[i]);
			} else if (daysAgo >= 10) {
				locationObj[manager.searchType]['10day'].data.push(response[i]);
			} else if (daysAgo >= 7) {
				locationObj[manager.searchType]['7day'].data.push(response[i]);
			} else if (daysAgo >= 6) {
				locationObj[manager.searchType]['6day'].data.push(response[i]);
			} else if (daysAgo >= 5) {
				locationObj[manager.searchType]['5day'].data.push(response[i]);
			} else if (daysAgo >= 4) {
				locationObj[manager.searchType]['4day'].data.push(response[i]);
			} else if (daysAgo >= 3) {
				locationObj[manager.searchType]['3day'].data.push(response[i]);
			} else if (daysAgo >= 2) {
				locationObj[manager.searchType]['2day'].data.push(response[i]);
			} else {
				locationObj[manager.searchType]['1day'].data.push(response[i]);
			}
		}

		manager.updateLocationInfo(locationID);

		if (manager.checkAllObservationsLoaded()) {
			manager.updateSpeciesData();
			manager.updateSpeciesTab();
			$('#hotspotTable').trigger("update").trigger("appendCache");
			manager.stopLoading();
		}
	},

	onErrorReturnObservations: function(locationID, response) {
		manager.allHotspots[locationID].observations.success = false;
		if (manager.checkAllObservationsLoaded()) {
			manager.stopLoading();
		}
	},

	updateLocationInfo: function(locationID) {
		var numSpecies = manager.allHotspots[locationID].observations[manager.searchType].numSpecies;
		var title = numSpecies + ' bird species seen at this location in the last ' + manager.observationRecency + ' days.';
		var row = $('#location_' + locationID);
		row.removeClass('notLoaded').addClass('loaded');

		if (numSpecies > 0) {
			row.find('.speciesCount').html(numSpecies).attr('title', title);
			$('#iw_' + locationID + ' .viewLocationBirds').append(' <b>' + numSpecies + '</b>');
		}
	},

	getSpeciesCountForRecency: function(locationID, recency, searchType) {
		var numSpecies = 0;
		if (manager.allHotspots.hasOwnProperty(locationID)) {
			var info = manager.allHotspots[locationID].observations[searchType];

/*			switch (recency) {
				case 30:
					numSpecies += info['30day'].numSpecies;
				case 25:
					numSpecies += info['25day'].numSpecies;
				case 20:
					numSpecies += info['20day'].numSpecies;
				case 15:
					numSpecies += info['15day'].numSpecies;
				case 10:
					numSpecies += info['10day'].numSpecies;
				case 7:
					numSpecies += info['7day'].numSpecies;
				case 6:
					numSpecies += info['6day'].numSpecies;
				case 5:
					numSpecies += info['5day'].numSpecies;
				case 4:
					numSpecies += info['4day'].numSpecies;
				case 3:
					numSpecies += info['3day'].numSpecies;
				case 2:
					numSpecies += info['2day'].numSpecies;
				case 1:
					numSpecies += info['1day'].numSpecies;
					break;
				default:
					break;
			}
*/
		}
		return numSpecies;
	},

	/**
	 * Retrieves all hotspots for a region.
	 */
	getHotspots: function() {
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
					for (var i=0; i<response.length; i++) {
						var locationID = response[i].i;
						if (!manager.allHotspots.hasOwnProperty(locationID)) {
							manager.allHotspots[locationID] = response[i];
						}
					}
					map.clear();
					manager.updatePage();
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
	updatePage: function() {

		// this function does the job of trimming the list for us, if there's > MAX_HOTSPOTS
		manager.visibleHotspots = map.addMarkersAndReturnVisible();

		manager.numVisibleHotspots = manager.visibleHotspots.length;
		manager.displayHotspots();
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
		$('#messageBar').css('display', 'none').removeClass().addClass(messageType).html(message).fadeIn(300);
	},

	startLoading: function() {
		$('#loadingSpinner').fadeIn(200);
	},

	stopLoading: function() {
		$('#loadingSpinner').fadeOut(200);
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
			if (!manager.allHotspots[currLocationID].hasOwnProperty('observations')) {
				rowClass = ' notLoaded';
				checkedAttr = 'checked="checked"';
			}

			html += '<tr id="location_' + currLocationID + '">' +
						'<td><input type="checkbox" id="row' + i + '" ' + checkedAttr + ' /></td>' +
						'<td class="loadingStatus' + rowClass + '"><label for="row' + i + '">' + manager.allHotspots[currLocationID].n + '</label></td>' +
						'<td class="sp"><span class="speciesCount"></span></td>' +
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
	}

};


// add parser through the tablesorter addParser method
$.tablesorter.addParser({
	id: 'species',
	is: function(s) {
		return false;
	},
	format: function(s, table, cell, cellIndex) {
		return $(cell).find('span').text();
	},

	type: 'numeric'
});



// start 'er up (on DOM ready)
$(manager.init);