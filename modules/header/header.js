define([
	"manager",
	"constants",
	"text!headerTemplate"
], function(manager, C, template) {

	var MODULE_ID = "header";


	var _run = function() {
		$("header").html(template);
		_addEventHandlers();
	};

	var _addEventHandlers = function() {
		$(document).on("click", "#aboutLink", function(e) {
			e.preventDefault();
			manager.publish({
				type: C.EVENT.ABOUT_LINK_CLICK
			});
		});

		$(document).on("click", "#contactLink", function(e) {
			e.preventDefault();
			manager.publish({
				type: C.EVENT.CONTACT_LINK_CLICK
			});
		});
	};

	manager.register(MODULE_ID, {
		run: _run
	});
});