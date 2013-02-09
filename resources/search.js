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
	},

	handleWindowResize: function() {
		// set the height and width of the map and sidebar 
		var windowHeight = $(window).height();
		var windowWidth = $(window).width();
		$('#mapCanvas,#sidebar').css('height', windowHeight - 40);
		$('#mapCanvas').css('width', windowWidth - 270);
	},

	addEventHandlers: function() {
		$('#observationRecency').bind('change', search.onChangeObservationRecency);
	},

	onChangeObservationRecency: function(e) {
		search.observationRecency = $(e.target).val();
		search.getHotspots();
	},

	onDisplayHotspots: function(data) {
		var numHotspots = data.length;
		$('#numHotspotsFound span').html(data.length);
	},

	// AJAX methods
	getHotspots: function() {
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
