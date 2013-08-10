define([
	"mediator",
	"constants",
	"underscore",
	"moduleHelper",
	"text!mainPanelTemplate",
	"text!notableSightingsDetailsTableTemplate",
	"map"
], function(mediator, C, _, helper, mainTemplate, notableSightingsDetailsTemplate, map) {

	var _MODULE_ID = "mainPanel";
	var _currTabID = "mapTab";

	var _init = function() {
		var subscriptions = {};
		subscriptions[C.EVENT.WINDOW_RESIZE] = _resizeMainPanel;
		subscriptions[C.EVENT.SEARCH_TYPE_CHANGED] = _onSearchTypeChange;
		subscriptions[C.EVENT.MAP.VIEW_NOTABLE_SIGHTING_DETAILS] = _showNotableSightingsDetailsTable;
		mediator.subscribe(_MODULE_ID, subscriptions);

		// insert the main panel
		var tmpl = _.template(mainTemplate, {
			L: helper.L
		});

		$("#mainPanel").html(tmpl);
		_addMainPanelEvents();

		// insert the map
		map.create();
	};

	var _addMainPanelEvents = function() {
		$("#panelTabs").on("click", "li", _onClickSelectTab);
	};

	var _onClickSelectTab = function(e) {
		var tab = e.target;
		if ($(tab).hasClass('disabled')) {
			return;
		}
		var tabID = $(tab).attr("id");
		_selectTab(tabID);
	};

	var _selectTab = function(tabID) {
		if (tabID == _currTabID) {
			return;
		}

		$("#panelTabs li").removeClass("selected");
		$('#' + tabID).addClass("selected");
		$('#' + mediator.currTabID + 'Content').addClass("hidden");
		$('#' + tabID + 'Content').removeClass("hidden");

		_currTabID = tabID;
		mediator.publish(_MODULE_ID, C.EVENT.SELECT_TAB, { tab: _currTabID });
	};

	var _resizeMainPanel = function(msg) {
		if (msg.data.viewportMode === "desktop") {
			$('#locationsTab').addClass('hidden');
			$('#mainPanel').css({
				height: msg.data.height - 54,
				width: msg.data.width - 318
			});
		} else {
			$('#locationsTab').removeClass("hidden");
			var panelHeight = msg.data.height - 210;
			$('#mainPanel').css({ height: panelHeight + 'px', width: '100%' });
		}
	};

	var _onSearchTypeChange = function(msg) {

	};

	var _showNotableSightingsDetailsTable = function(msg) {

		// construct the table
		var details = _generateNotableSightingsTable(msg.data);

		// hide the map
		$("#mapTab").removeClass("btn-primary");
		$("#mapTabContent").addClass("hidden");

		// update the tab label and show the tab
		$("#birdSpeciesTab").addClass("btn-primary").removeClass("disabledTab").html(details.locationName);
		$("#birdSpeciesTabContent").removeClass("hidden").html(details.html);
	};

	var _generateNotableSightingsTable = function(search) {
		var locationID = search.locationID;
		var lastSearch = search.lastSearchNotableSightings;
		var searchObservationRecency = search.lastSearchObservationRecency;

		var sightings = [];
		var locationName = null;
		var lat = null;
		var lng = null;
		for (var i=0; i<lastSearch.length; i++) {
			if (lastSearch[i].locationID !== locationID) {
				continue;
			}
			locationName = lastSearch[i].n;
			lat = lastSearch[i].lat;
			lng = lastSearch[i].lng;
			sightings = lastSearch[i].sightings;
			break;
		}

		var html = _.template(notableSightingsDetailsTemplate, {
			locationName: locationName,
			lat: lat,
			lng: lng,
			searchObservationRecency: searchObservationRecency,
			sightings: sightings
		});


		return {
			locationName: locationName,
			html: html
		};
	};


	mediator.register(_MODULE_ID, {
		init: _init
	});
});
