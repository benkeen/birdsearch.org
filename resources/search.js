/*jslint browser:true*/
/*global $:false,map:false,manager:false,console:false*/
'use strict';

var search = {

	regionType: null,
	region: null,
	observationRecency: null,

	searchField: null,

	activeHotspotRequest: false,
	maxNumHotspots: 50,


	init: function() {
		$(window).resize(search.handleWindowResize);

		// and ensure the page is initialized properly
		search.handleWindowResize();

		// add the appropriate event handlers to detect when the seach settings have changed
		search.addEventHandlers();

		// make a note of some important DOM elements
		search.searchField = $('#searchTextField')[0];

		// set the default values
		search.observationRecency = $('#observationRecency').val();

		// initialize the map
		map.initialize();

		// focus!
		$(search.searchField).focus();
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
		$('#observationRecency').bind('change', search.onChangeObservationRecency);
	},

	onChangeObservationRecency: function(e) {
		search.observationRecency = $(e.target).val();
		search.getHotspots();
	},

	/**
	 * Gets called by map.js when the markers have been loaded onto the screen. This updates
	 * the sidebar and starts requesting the hotspot observation data.
	 */
	onDisplayHotspots: function(data) {
		manager.hotspots = data;
		manager.numHotspots = data.length;
		$('#numHotspotsFound span').html(manager.numHotspots);

		var html = search.generateHotspotTable(data);
		$('#searchResults').html(html).removeClass('hidden');

		// now start requesting all the observation data for each hotspot
		search.getAllHotspotObservations();
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


	// AJAX methods
	
	/**
	 * Loop through all hotspots returned and fire off Ajax requests for each,
	 */
	getAllHotspotObservations: function() {
		for (var i=0; i<manager.numHotspots; i++) {
			search.getSingleHotspotObservation(manager.hotspots[i].i);
		}
	},

	getSingleHotspotObservation: function(locationID) {
		$.ajax({
			url: "ajax/getHotspotObservations.php",
			data: {
				locationID: locationID,
				recency: search.observationRecency
			},
			type: "POST",
			dataType: "json",
			success: function(response) {
				search.onSuccessReturnObservations(locationID, response);
			},
			error: search.onErrorReturnObservations
		});
	},

	onSuccessReturnObservations: function(locationID, response) {
		var hotspotIndex = search.getHotspotLocationIndex(locationID);
		manager.hotspots[hotspotIndex].observations = {
			success: true,
			data: response
		};

		$('#location_' + locationID + ' .notLoaded').removeClass('notLoaded').addClass('loaded');

		if (search.checkAllObservationsLoaded()) {
			search.stopLoading();
			manager.init();
		}
	},
	
	onErrorReturnObservations: function(locationID, response) {
		var hotspotIndex = search.getHotspotLocationIndex(locationID);
		manager.hotspots[hotspotIndex].observations = {
			success: false
		};

		if (search.checkAllObservationsLoaded()) {
			search.stopLoading();
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
		search.activeHotspotRequest = true;
		search.startLoading();
		$.ajax({
			url: "ajax/getHotspots.php",
			data: {
				regionType: search.regionType,
				region: search.region,
				recency: search.observationRecency
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
	}
};

// start 'er up (on DOM ready)
$(search.init);
