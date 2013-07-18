define([
	"manager",
	"constants",
	"text!mainPanelTemplate",
	"map"
], function(manager, C, template, map) {

	var MODULE_ID = "mainPanel";
	var _currTabID = "mapTab";


	var _init = function() {

		// insert the main panel
		$("#mainPanel").html(template);
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
		$('#' + manager.currTabID + 'Content').addClass("hidden");
		$('#' + tabID + 'Content').removeClass("hidden");

		// publish an event

//		if (tabID == "mapTab") {
//			manager.redrawMap();
//		}


		_currTabID = tabID;

		manager.publish({
			type: C.EVENT.SELECT_TAB,
			tab: tabID
		})
	};

	manager.register(MODULE_ID, {
		init: _init
	});
});
