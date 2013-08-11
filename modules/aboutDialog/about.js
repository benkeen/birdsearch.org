define([
	"mediator",
	"constants",
	"text!aboutTemplate"
], function(mediator, C, template) {

	var _MODULE_ID = "aboutDialog";
	var _currTab = "about";


	var _init = function() {
		$("body").append(template);

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