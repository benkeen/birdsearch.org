define([
	"manager"
], function(manager) {

	var _MODULE_ID = "page";
	var _VIEWPORT_WIDTH_BREAKPOINT = 640;

	var _pageViewportMode;


	var _init = function() {
		$(window).resize(_handleWindowResize);
	};

	var _handleWindowResize = function() {
		var windowHeight = $(window).height();
		var windowWidth  = $(window).width();

		if (windowWidth < _VIEWPORT_WIDTH_BREAKPOINT) {
			_pageViewportMode = 'mobile';
		} else {
			_pageViewportMode = 'desktop';
		}

		if (_pageViewportMode === 'desktop') {
			$('#locationsTab').addClass('hidden');
			$('#sidebar').css('height', windowHeight - 77);
			$('#mainPanel').css({
				height: windowHeight - 54,
				width: windowWidth - 325
			});
			$('#panelContent').css('height', windowHeight - 82);
			$('#fullPageSearchResults').css('height', windowHeight - 267);
		} else {
			$('#locationsTab').removeClass('hidden');
			$('#sidebar').css('height', 'auto');
			$('#panelContent').css('height', windowHeight - 40);

			var panelHeight = windowHeight - 210;
			$('#mainPanel').css({ height: panelHeight + 'px', width: '100%' });
		}


		if (manager.currTabID == 'mapTab') {
			var address = $.trim(manager.searchField.value);
			if (address !== '') {
				manager.updatePage(false);
			}
		}
	};


	manager.register(_MODULE_ID, {
		init: _init
	});
});