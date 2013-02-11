/*jslint browser:true*/
/*global $:false,map:false,console:false*/
'use strict';

var manager = {

	// hotspots contains ALL the data, grouped by hotspots
	hotspots: null,
	numHotspots: null,
	species: {},
	numSpecies: 0,


	regionType: null,
	region: null,
	observationRecency: null,

	searchField: null,

	activeHotspotRequest: false,
	maxNumHotspots: 50,


	init: function() {
		$(window).resize(manager.handleWindowResize);

		// and ensure the page is initialized properly
		manager.handleWindowResize();

		// add the appropriate event handlers to detect when the seach settings have changed
		manager.addEventHandlers();

		// make a note of some important DOM elements
		manager.searchField = $('#searchTextField')[0];

		// set the default values
		manager.observationRecency = $('#observationRecency').val();

		// initialize the map
		map.initialize();

		// focus!
		$(manager.searchField).focus();
	},

	// not the prettiest thing ever, but since flexbox isn't implemented in all browsers yet...
	handleWindowResize: function() {
		var windowHeight = $(window).height();
		var windowWidth = $(window).width();
		$('#sidebar').css('height', windowHeight - 40);
		$('#mainPanel').css('height', windowHeight - 74);
		$('#mainPanel').css('width', windowWidth - 280);
		$('#searchResults').css('height', windowHeight - 100);
	},

	addEventHandlers: function() {
		$('#observationRecency').bind('change', manager.onChangeObservationRecency);
	},

	onChangeObservationRecency: function(e) {
		manager.observationRecency = $(e.target).val();
		manager.getHotspots();
	},

	/**
	 * Gets called by map.js when the markers have been loaded onto the screen. This updates
	 * the sidebar and starts requesting the hotspot observation data.
	 */
	onDisplayHotspots: function(data) {
		manager.hotspots = data;
		manager.numHotspots = data.length;
		$('#numHotspotsFound span').html(manager.numHotspots);

		var html = manager.generateHotspotTable(data);
		$('#searchFieldResults').html(html).removeClass('hidden');

		// now start requesting all the observation data for each hotspot
		manager.getAllHotspotObservations();
	},

	// should be templated, of course
	generateHotspotTable: function(data) {
		var html = '<table><tr><th width="20"><input type="checkbox" checked="checked" /></th><th>Location</th><th></th></tr>';
		for (var i=0; i<data.length; i++) {
			html += '<tr id="location_' + data[i].i + '">' +
				'<td width="20"><input type="checkbox" checked="checked" /></td>' +
				'<td><a href="">' + data[i].n + '</a></td>' +
				'<td class="loadingStatus notLoaded"></td>' +
				'</tr>';
		}
		html += '</table>';
		return html;
	},


	/**
	 * Loop through all hotspots returned and fire off Ajax requests for each,
	 */
	getAllHotspotObservations: function() {
		for (var i=0; i<manager.numHotspots; i++) {
			manager.getSingleHotspotObservation(manager.hotspots[i].i);
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
		var hotspotIndex = manager.getHotspotLocationIndex(locationID);
		manager.hotspots[hotspotIndex].observations = {
			success: true,
			data: response
		};

		$('#location_' + locationID + ' .notLoaded').removeClass('notLoaded').addClass('loaded');

		if (manager.checkAllObservationsLoaded()) {
			manager.stopLoading();
			manager.createSpeciesMap();
			$('#birdSpeciesTab').removeClass('disabled').html('Bird Species (' + manager.numSpecies + ')');
		}
	},
	
	onErrorReturnObservations: function(locationID, response) {
		var hotspotIndex = manager.getHotspotLocationIndex(locationID);
		manager.hotspots[hotspotIndex].observations = {
			success: false
		};

		if (manager.checkAllObservationsLoaded()) {
			manager.stopLoading();
		}
	},

	getHotspotLocationIndex: function(locationID) {
		var index = null;
		for (var i=0; i<manager.numHotspots; i++) {
			if (manager.hotspots[i].i == locationID) {
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
		for (var i=0; i<manager.numHotspots; i++) {
			if (!manager.hotspots[i].hasOwnProperty('observations')) {
				allLoaded = false;
				break;
			}
		}
		return allLoaded;
	},

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
			success: map.displayHotspots,
			error: function(response) {
				console.log("error: ", response);
			}
		});
	},

	startLoading: function() {
		$('#loadingSpinner').show();
	},

	stopLoading: function() {
		$('#loadingSpinner').hide();
	},


	createSpeciesMap: function() {
		manager.species = {};
		manager.numSpecies = 0;
		for (var i=0; i<manager.numHotspots; i++) {

			// if this hotspots observations failed to load (for whatever reason), just ignore the row
			if (!manager.hotspots[i].observations.success) {
				continue;
			}

			var numObservations = manager.hotspots[i].observations.data.length;
			for (var j=0; j<numObservations; j++) {
				var sciName = manager.hotspots[i].observations.data[j].sciName;

				if (!manager.species.hasOwnProperty(sciName)) {
					console.log(sciName);
					manager.species[sciName] = [];
					manager.numSpecies++;
				}
				manager.species[sciName].push(manager.hotspots[i].observations.data[j]);
			}
		}
	}
};


// start 'er up (on DOM ready)
$(manager.init);