<!DOCTYPE html>
<html>
<head>
	<title>birdsearch.org</title>
	<meta name="description" content="birdsearch.org - browse worldwide birding locations and sightings" />
	<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0">
	<link href="css/bootstrap.css" rel="stylesheet" type="text/css" />
	<link href="css/bootstrap.min.css" rel="stylesheet">
	<link href="css/compiled/styles.css" rel="stylesheet" type="text/css" />
	<link href="css/dark-hive/jquery-ui-1.10.3.custom.min.css" rel="stylesheet" type="text/css" />
</head>
<body data-serverdatetime="<?php echo date('U'); ?>">

	<header></header>
	<section id="sidebar"></section>
	<section id="mainPanel"></section>
	<footer></footer>

	<!-- remove...
	<div id="mobileNoResultsFound">
		<h4>No results found</h4>
		<p><a href="#" class="returnToSearch">&laquo; return to search</a></p>
	</div>
	-->

	<script src="libs/html5shiv.js"></script>
	<script src="libs/modernizr-2.0.6.min.js"></script>
	<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCrkl7BoiKPc5Kero35JCn7KilIFx-AWUg&sensor=false&libraries=places,geometry"></script>
	<script src="libs/require-jquery.js" data-main="appStart"></script>
	<script src="core/requireConfig.js"></script>
	<script src="libs/jquery-ui-1.10.3.custom.min.js"></script>
	<script src="libs/spinners.js"></script>

	<script>
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-39092291-1']);
	_gaq.push(['_trackPageview']);
	(function() {
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();
	</script>

</body>
</html>