/**
 * This module handles anything generic applying to the page as a whole: window resize events,
 * for example.

 requirejs.config({
	baseUrl: '',
	paths: {

		// core stuff
		text: "libs/text",
		mediator: "core/mediator",
		dataCache: "core/dataCache",
		page: "core/page",
		constants: "core/constants",
		moduleHelper: "core/moduleHelper",

		// page components
		header: "modules/header/header",
		headerTemplate: "modules/header/header.html",
		sidebar: "modules/sidebar/sidebar",
		sidebarTemplate: "modules/sidebar/sidebar.html",
		sidebarResultsTable: "modules/sidebar/sidebarResultsTable.html",
		aboutDialog: "modules/aboutDialog/about",
		aboutTemplate: "modules/aboutDialog/about.html",
		mainPanel: "modules/mainPanel/mainPanel",
		mainPanelTemplate: "modules/mainPanel/mainPanel.html",
		birdSightingsTableTemplate: "modules/mainPanel/birdSightingsTable.html",
		singleBirdSightingsTableTemplate: "modules/mainPanel/singleBirdSightingsTable.html",
		notableSightingsTableTemplate: "modules/mainPanel/notableSightingsTable.html",
		map: "modules/map/map",
		allSightingsInfoWindowTemplate: "modules/map/allSightingsInfoWindow.html",
		notableSightingsInfoWindowTemplate: "modules/map/notableSightingsInfoWindow.html",

		// helpers
		tablesorter: "libs/jquery.tablesorter.min",
		underscore: "libs/underscore.min",
		moment: "libs/moment.min",

		// language files
		lang_en: "lang/en",
		lang_fr: "lang/fr",
		lang_de: "lang/de",
		lang_es: "lang/es"
	},
	urlArgs: "v=2",
	shim: {
		'tablesorter': "jquery"
	}
});


 define([
 "mediator",
 "constants"
 ], function(mediator, C) {

	var _MODULE_ID = "page";
	var _VIEWPORT_WIDTH_BREAKPOINT = 640; // where should this live?


	var _init = function() {
		$(window).resize(_handleWindowResize);

		var subscriptions = {};
		subscriptions[C.EVENT.TRIGGER_WINDOW_RESIZE] = _handleWindowResize;
		mediator.subscribe(_MODULE_ID, subscriptions);
	};

	var _handleWindowResize = function() {
		var windowHeight = $(window).height();
		var windowWidth  = $(window).width();

		var viewportMode = 'desktop';
		if (windowWidth < _VIEWPORT_WIDTH_BREAKPOINT) {
			viewportMode = 'mobile';
		}

		mediator.publish(_MODULE_ID, C.EVENT.WINDOW_RESIZE, {
			viewportMode: viewportMode,
			width: windowWidth,
			height: windowHeight
		});
	};

	mediator.register(_MODULE_ID, {
		init: _init
	});
});

 //dataCache.js
 // not e
 define([
 "moment"
 ], function(moment) {

	var _MODULE_ID = "dataCache";
	var _hotspotData = {};


	var _getHotspots = function() {
		return _hotspotData;
	};

	var _formatHotspotData = function(data) {
		var hotspotData = [];
		for (var i=0; i<data.length; i++) {
			hotspotData.push({
				locationID: data[i].i,
				lat: data[i].la,
				lng: data[i].lg,
				n: data[i].n
			});
		}
		return hotspotData;
	};

var _formatBirdSightingsData = function(data) {
  var locations = {};
  for (var i=0; i<data.length; i++) {
    var currLocationID = data[i].locID;
    if (!locations.hasOwnProperty(currLocationID)) {
      locations[currLocationID] = {
        locationID: currLocationID,
        lat: data[i].lat,
        lng: data[i].lng,
        n: data[i].locName,
        sightings: []
      };
    }

    locations[currLocationID].sightings.push({
      comName: data[i].comName,
      sciName: data[i].sciName,
      obsDt_unixtime: moment(data[i].obsDt, 'YYYY-MM-DD HH:mm').unix(),
      obsDt: moment(data[i].obsDt, 'YYYY-MM-DD HH:mm').format('MMM Do, h:mm a'),
      obsReviewed: data[i].obsReviewed,
      obsValid: data[i].obsValid,
      howMany: data[i].howMany,
    });
  }

  // now convert the info into an array
  var foundLocations = [];
  for (var locID in locations) {
    foundLocations.push(locations[locID]);
  }

  return foundLocations;
};

var _formatNotableSightingsData = function(data) {
  var notableSightingsData = {};

  for (var i=0; i<data.length; i++) {
    var currLocationID = data[i].locID;

    if (!notableSightingsData.hasOwnProperty(currLocationID)) {
      notableSightingsData[currLocationID] = {
        locationID: currLocationID,
        lat: data[i].lat,
        lng: data[i].lng,
        n: data[i].locName,
        sightings: []
      };
    }

    notableSightingsData[currLocationID].sightings.push({
      comName: data[i].comName,
      sciName: data[i].sciName,
      obsDt_unixtime: moment(data[i].obsDt, 'YYYY-MM-DD HH:mm').unix(),
      obsDt: moment(data[i].obsDt, 'YYYY-MM-DD HH:mm').format('MMM Do, h:mm a'),
      obsReviewed: data[i].obsReviewed,
      obsValid: data[i].obsValid,
      howMany: data[i].howMany,
      reporterName: data[i].firstName + " " + data[i].lastName
    });
  }

  // now convert the info into an array
  var foundLocations = [];
  for (var locID in notableSightingsData) {
    foundLocations.push(notableSightingsData[locID]);
  }

  return foundLocations;
};

return {
  getHotspots: _getHotspots,
  formatHotspotData: _formatHotspotData,
  formatNotableSightingsData: _formatNotableSightingsData,
  formatBirdSightingsData: _formatBirdSightingsData
};
});

 */
