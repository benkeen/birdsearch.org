define([
	"manager",
	"constants",
	"text!mainPanelTemplate",
	"map"
], function(manager, C, template, map) {

	var _MODULE_ID = "mainPanel";
	var _currTabID = "mapTab";


	var _init = function() {

		var subscriptions = {};
		subscriptions[C.EVENT.WINDOW_RESIZE] = _resizeMainPanel;
		manager.subscribe(_MODULE_ID, subscriptions);

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

		_currTabID = tabID;

		manager.publish(_MODULE_ID, C.EVENT.SELECT_TAB, { tab: _currTabID });
	};

	var _resizeMainPanel = function(msg) {
		if (msg.data.viewportMode === "desktop") {
			$('#locationsTab').addClass('hidden');
			$('#mainPanel').css({
				height: msg.data.height - 54,
				width: msg.data.width - 325
			});
		} else {
			$('#locationsTab').removeClass("hidden");
			var panelHeight = msg.data.height - 210;
			$('#mainPanel').css({ height: panelHeight + 'px', width: '100%' });
		}
	};

	manager.register(_MODULE_ID, {
		init: _init
	});
});
