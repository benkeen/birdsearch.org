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

	species: {},
	numSpecies: 0,

	regionType: null,
	region: null,
	observationRecency: null,
	searchField: null,
	activeHotspotRequest: false,
	currTabID: 'mapTab',
	currentHoveredRowLocationID: null,
	
	// some constants
	CURRENT_SERVER_TIME: null,
	ONE_DAY_IN_SECONDS: 24 * 60 * 60,


	init: function() {
		$(window).resize(manager.handleWindowResize);

		// make a note of the current server time. This is used to ensure date calculations don't go
		// wonky if the user's system clock is off
		manager.CURRENT_SERVER_TIME = parseInt($('body').data('serverdatetime'), 10);

		// prep the page elements to ensure they're the right size
		manager.handleWindowResize();

		// add the appropriate event handlers to detect when the search settings have changed
		manager.addEventHandlers();

		// make a note of some important DOM elements
		manager.searchField = $('#searchTextField')[0];

		// set the default values
		manager.observationRecency = parseInt($('#observationRecency').val(), 10);

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
		$('#searchResults').css('height', windowHeight - 110);
		manager.updatePage();
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
			manager.currentHoveredRowLocationID = locationID;
		}
	},

	onHoverOutHotspotRow: function() {
		if (manager.currentHoveredRowLocationID != null && map.markers.hasOwnProperty(manager.currentHoveredRowLocationID)) {
			map.markers[manager.currentHoveredRowLocationID].setIcon('resources/images/marker.png');
		}
		manager.currentHoveredRowLocationID = null;
	},

	/**
	 * Loop through all hotspots returned and if we don't have data already loaded for it, fire off an Ajax
	 * request for it.
	 */
	getAllHotspotObservations: function() {

		// TODO couldn't this have been changing in the meantime?
		var recencyKey = manager.observationRecency + 'day';

		for (var i=0; i<manager.numVisibleHotspots; i++) {
			var currLocationID = manager.visibleHotspots[i];

			// check allHotspots to see if this data has been loaded yet. If not, prep the object. To reduce
			// server requests, we intelligently categorize all sightings in the appropriate pocket (1day, 2day
			// etc.) That way, if the user does a search for 30 days then reduces the recency setting, we don't
			// need any superfluous requests. If a request for 30 days goes through, ALL dataByRecency properties
			// have their available property set to true
			if (!manager.allHotspots[currLocationID].hasOwnProperty('observations')) {
				manager.allHotspots[currLocationID].isDisplayed = false;
				manager.allHotspots[currLocationID].numSpecies = 0;
				manager.allHotspots[currLocationID].observations = {
					success: null,
					dataByRecency: {
						'1day': { available: false, data: [] },
						'2day': { available: false, data: [] },
						'3day': { available: false, data: [] },
						'4day': { available: false, data: [] },
						'5day': { available: false, data: [] },
						'6day': { available: false, data: [] },
						'7day': { available: false, data: [] },
						'10day': { available: false, data: [] },
						'15day': { available: false, data: [] },
						'20day': { available: false, data: [] },
						'25day': { available: false, data: [] },
						'30day': { available: false, data: [] }
					}
				};
			}

			// if we've already retrieved the hotspot data, just update the
			if (manager.allHotspots[currLocationID].observations.dataByRecency[recencyKey].available) {
				var numSpecies = manager.allHotspots[currLocationID].numSpecies;
				var title = numSpecies + " bird species seen at this location in the last " + manager.observationRecency + " days.";
				var row = $('#location_' + currLocationID);
				row.removeClass('notLoaded').addClass('loaded').find(".speciesCount").html(numSpecies).attr("title", title);
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
				recency: manager.observationRecency // TODO again: this value should be frozen
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
		manager.allHotspots[locationID].isDisplayed = true;
		manager.allHotspots[locationID].observations.success = true;
		manager.allHotspots[locationID].numSpecies = response.length;

		// erk. bit kruddy... maybe pick a different data structure?
		switch (manager.observationRecency) {
			case 30:
				manager.allHotspots[locationID].observations.dataByRecency['30day'].available = true;
			case 25:
				manager.allHotspots[locationID].observations.dataByRecency['25day'].available = true;
			case 20:
				manager.allHotspots[locationID].observations.dataByRecency['20day'].available = true;
			case 15:
				manager.allHotspots[locationID].observations.dataByRecency['15day'].available = true;
			case 10:
				manager.allHotspots[locationID].observations.dataByRecency['10day'].available = true;
			case 7:
				manager.allHotspots[locationID].observations.dataByRecency['7day'].available = true;
			case 6:
				manager.allHotspots[locationID].observations.dataByRecency['6day'].available = true;
			case 5:
				manager.allHotspots[locationID].observations.dataByRecency['5day'].available = true;
			case 4:
				manager.allHotspots[locationID].observations.dataByRecency['4day'].available = true;
			case 3:
				manager.allHotspots[locationID].observations.dataByRecency['3day'].available = true;
			case 2:
				manager.allHotspots[locationID].observations.dataByRecency['2day'].available = true;
			case 1:
				manager.allHotspots[locationID].observations.dataByRecency['1day'].available = true;
				break;
			default:
				break;
		}

		// now for the exciting part: loop through all the observations and put them in the appropriate spot
		// in the data structure
		for (var i=0; i<response.length; i++) {
			var observationTime = parseInt(moment(response[i].obsDt, 'YYYY-MM-DD HH:mm').format('X'), 10);
			var difference = manager.CURRENT_SERVER_TIME - observationTime;
			var daysAgo = Math.ceil(difference / manager.ONE_DAY_IN_SECONDS);

			if (daysAgo >= 30) {
				manager.allHotspots[locationID].observations.dataByRecency['30day'].data.push(response[i]);
			} else if (daysAgo >= 25) {
				manager.allHotspots[locationID].observations.dataByRecency['25day'].data.push(response[i]);
			} else if (daysAgo >= 20) {
				manager.allHotspots[locationID].observations.dataByRecency['20day'].data.push(response[i]);
			} else if (daysAgo >= 15) {
				manager.allHotspots[locationID].observations.dataByRecency['15day'].data.push(response[i]);
			} else if (daysAgo >= 10) {
				manager.allHotspots[locationID].observations.dataByRecency['10day'].data.push(response[i]);
			} else if (daysAgo >= 7) {
				manager.allHotspots[locationID].observations.dataByRecency['7day'].data.push(response[i]);
			} else if (daysAgo >= 6) {
				manager.allHotspots[locationID].observations.dataByRecency['6day'].data.push(response[i]);
			} else if (daysAgo >= 5) {
				manager.allHotspots[locationID].observations.dataByRecency['5day'].data.push(response[i]);
			} else if (daysAgo >= 4) {
				manager.allHotspots[locationID].observations.dataByRecency['4day'].data.push(response[i]);
			} else if (daysAgo >= 3) {
				manager.allHotspots[locationID].observations.dataByRecency['3day'].data.push(response[i]);
			} else if (daysAgo >= 2) {
				manager.allHotspots[locationID].observations.dataByRecency['2day'].data.push(response[i]);
			} else if (daysAgo >= 1) {
				manager.allHotspots[locationID].observations.dataByRecency['1day'].data.push(response[i]);
			} else {
				// shouldn't occur
			}
		}

		var numSpecies = response.length;
		var title = response.length + " bird species seen at this location in the last " + manager.observationRecency + " days.";
		var row = $('#location_' + locationID);
		row.removeClass('notLoaded').addClass('loaded');
		row.find(".speciesCount").html(response.length).attr("title", title);

		if (manager.checkAllObservationsLoaded()) {
			manager.stopLoading();
			manager.createSpeciesMap();
			manager.updateSpeciesTab();
		}
	},
	
	onErrorReturnObservations: function(locationID, response) {
		manager.allHotspots[locationID].observations.success = false;
		if (manager.checkAllObservationsLoaded()) {
			manager.stopLoading();
		}
	},

	getHotspotLocationIndex: function(locationID) {
		var index = null;
		for (var i=0; i<manager.numVisibleHotspots; i++) {
			if (manager.visibleHotspots[i] === locationID) {
				index = i;
				break;
			}
		}
		return index;
	},

	/**
	 * Called after any observations has been returned. It looks through all of data.hotspots
	 * and confirms every one has an observations property (they are added after a response - success
	 * or failure).
	 */
	checkAllObservationsLoaded: function() {
		var allLoaded = true;
		for (var i=0; i<manager.visibleHotspots; i++) {
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
						manager.allHotspots[locationID] = response[i];
					}
					map.clear();
					manager.updatePage();
				}
			},
			error: function(response) {
				manager.activeHotspotRequest = false;
				console.log("error: ", response);
			}
		});
	},

	updatePage: function() {
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
				$("#hotspotTable").trigger("destroy");
			} catch (e) { }

			$('#messageBar').addClass('notification').removeClass('hidden error').html('<b>' + manager.numVisibleHotspots + '</b> ' + locationStr + ' found').fadeIn(300);
			$('#searchResults').html(html).fadeIn(300);

			$("#hotspotTable").tablesorter({
				//theme: 'bootstrap',
//				headerTemplate: '{content} {icon}',
				//widgets: ['zebra','columns', 'uitheme']
			});

			// now start requesting all the observation data for each hotspot
			manager.getAllHotspotObservations();
		} else {
			$('#messageBar').addClass('notification').removeClass('hidden error').html('No birding locations found').fadeIn(300);
			$('#searchResults').fadeOut(300);
			manager.stopLoading();
		}
	},

	startLoading: function() {
		$('#loadingSpinner').fadeIn(200);
	},

	stopLoading: function() {
		$('#loadingSpinner').fadeOut(200);
	},

	createSpeciesMap: function() {
		manager.species = {};
		manager.numSpecies = 0;

		for (var i=0; i<manager.numVisibleHotspots; i++) {
			var currLocationID = manager.visibleHotspots[i];

			// if this hotspots observations failed to load (for whatever reason), just ignore the row
			if (!manager.allHotspots[currLocationID].observations.success) {
				continue;
			}

			for (var daysAgo in manager.allHotspots[currLocationID].observations.dataByRecency) {
				var currGroup = manager.allHotspots[currLocationID].observations.dataByRecency[daysAgo];

				// if the observation data for this recency group (25 days, or whatever) hasn't been loaded
				// yet, forgetaboudit!
				if (!currGroup.available) {
					continue;
				}

				for (var j=0; j<currGroup.data.length; j++) {
					var currData = currGroup.data[j];
					var sciName  = currData.sciName;

					if (!manager.species.hasOwnProperty(sciName)) {
						manager.species[sciName] = {
							comName: currData.comName,
							sciName: currData.sciName,
							obs: []
						};
						manager.numSpecies++;
					}

					manager.species[sciName].obs.push({
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
					'<th width="40">SPECIES</th>' +
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
			widgets: ['zebra','columns', 'uitheme']
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
	}
};


// start 'er up (on DOM ready)
$(manager.init);