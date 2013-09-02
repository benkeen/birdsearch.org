define([
	"mediator",
	"constants",
	"moduleHelper",
	"text!aboutTemplate"
], function(mediator, C, helper, template) {

	var _MODULE_ID = "aboutDialog";
	var _currTab = "help";
	var _L = {};

	var _init = function() {
		require([helper.getCurrentLangFile()], function(L) {
			_L = L;
			var aboutPara1 = L.about_para1.replace(/%1/, '<a href="http://ebird.org" target="_blank">eBird.org</a>');
			var aboutPara4 = L.about_para4.replace(/%1/, '<a href="' + C.CORE.GITHUB_URL + '" target="_blank">github</a>');

			var className = "fade";
			if ($.browser.msie) {
				className = "";
			}

			var html = _.template(template, {
				L: _L,
				version: C.CORE.APP_VERSION,
				className: className,
				about_para1: aboutPara1,
				about_para4: aboutPara4
			});

			$("body").append(html);
			$(document).on("click", "#aboutDialogTabs li", _selectDialogTab);
		});
	};

	var _selectDialogTab = function(e) {
		var tab = $(e.target).data("tab");
		$("#aboutDialogTabs").find("li").removeClass("btn-primary");
		$(e.target).addClass("btn-primary");

		$("#" + _currTab + "TabContent").addClass("hidden");
		$("#" + tab + "TabContent").removeClass("hidden");
		_currTab = tab;
	};

	mediator.register(_MODULE_ID, {
		init: _init
	});
});