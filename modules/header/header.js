define([
	"underscore",
	"text!headerTemplate"
], function(_, template) {

	var _init = function() {
		console.log(template)
	};

	return {
		init: _init
	}
});