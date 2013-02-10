/*jslint browser:true*/
/*global $:false,map:false,console:false*/
'use strict';

var search = {

	regionType: null,
	region: null,
	observationRecency: null,

	// some dom elements
	mapCanvas: null,
	searchField: null,

	hotspots: [],
	activeHotspotRequest: false,


	init: function() {
		$(window).resize(search.handleWindowResize);

		// and ensure the page is initialized properly
		search.handleWindowResize();

		// add the appropriate event handlers to detect when the seach settings have changed
		search.addEventHandlers();

		// make a note of some important DOM elements
		search.mapCanvas   = $('#mapCanvas')[0];
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
		$('#searchResults').css('height', windowHeight - 160);
	},

	addEventHandlers: function() {
		$('#observationRecency').bind('change', search.onChangeObservationRecency);
	},

	onChangeObservationRecency: function(e) {
		search.observationRecency = $(e.target).val();
		search.getHotspots();
	},

	onDisplayHotspots: function(data) {
		search.hotspots = data;

		var numHotspots = data.length;
		$('#numHotspotsFound span').html(data.length);

		var html = search.generateHotspotTable(data);
		$('#searchResults').html(html).removeClass('hidden');

		// now start requesting all the observation data for each hotspot
		search.getAllHotspotObservations();
	},

	// should be templated, of course
	generateHotspotTable: function(data) {
		var html = '<table><tr><th width="20"><input type="checkbox" checked="checked" /></th><th>Location</th></tr>';
		for (var i=0; i<data.length; i++) {
			html += '<tr id="location_' + data[i].i + '">' +
				'<td width="20"><input type="checkbox" checked="checked" /></td>' +
				'<td><a href="">' + data[i].n + '</a></td></tr>';
		}
		html += '</table>';
		return html;
	},

	// AJAX methods
	
	getAllHotspotObservations: function() {

	},

	getSingleHotspotObservation: function(locationID) {
		$.ajax({
			url: "ajax/getHotspotObservations.php",
			data: {
				locationID: locationID
			},
			type: "POST",
			dataType: "json",
			success: map.displayHotspotObservations,
			error: function(response) {
				console.log("error: ", response);
			}
		});
	},

	getHotspots: function() {
		search.activeHotspotRequest = true;
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
	}
};

// start 'er up (on DOM ready)
$(search.init);
