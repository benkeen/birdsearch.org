define([
	"mediator",
	"constants",
	"moduleHelper",
	"text!aboutTemplate"
], function(mediator, C, helper, template) {

	var _MODULE_ID = "aboutDialog";
	var _currTab = "about";


	var _init = function() {
		var aboutPara1 = helper.L.about_para1.replace(/%1/, '<a href="http://ebird.org" target="_blank">eBird.org</a>');
		var aboutPara4 = helper.L.about_para4.replace(/%1/, '<a href="' + C.CORE.GITHUB_URL + '" target="_blank">github</a>');
		var html = _.template(template, {
			L: helper.L,
			about_para1: aboutPara1,
			about_para4: aboutPara4
		});

		$("body").append(html);
		$(document).on("click", "#aboutDialogTabs li", _selectDialogTab);
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