/*jslint browser:true*/
/*global $:false,console:false*/
'use strict';

var manager = {

	// hotspots contains ALL the data, grouped by hotspots. The vars to follow contain
	// the same information just arranged in more convenient format
	hotspots: null,
	numHotspots: null,

	//
	species: {},
	numSpecies: 0,


	/**
	 * This is called whenever the hotspot and observation data has been fully loaded. It
	 * performs various manipulations on the data set to put it into a readily accessible format.
	 */
	init: function() {
		manager.createSpeciesMap();

		$('#birdSpeciesTab').removeClass('disabled').html('Bird Species (' + manager.numSpecies + ')');
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