<!DOCTYPE html>
<html>
<head>
	<title>eBirdsearch.org</title>
	<meta name="description" content="eBirdsearch.org - browse birding locations and sightings worldwide" />	
	<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0">
	<link href="resources/css/bootstrap.css" rel="stylesheet" type="text/css" />
	<link href="resources/css/theme.bootstrap.css" rel="stylesheet" type="text/css" />
	<link href="resources/css/styles.css" rel="stylesheet" type="text/css" />
</head>
<body data-serverdatetime="<?php echo date('U'); ?>">

	<header></header>
	<div id="backLeft"><div></div></div>
	<section id="sidebar"></section>
	<section id="mainPanel"></section>
	<footer></footer>

	<!-- remove...
	<div id="mobileNoResultsFound">
		<h4>No results found</h4>
		<p><a href="#" class="returnToSearch">&laquo; return to search</a></p>
	</div>
	-->

	<script src="resources/js/libs/html5shiv.js"></script>
	<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCrkl7BoiKPc5Kero35JCn7KilIFx-AWUg&sensor=false&libraries=places"></script>
	<script src="resources/js/libs/require-jquery.js" data-main="app-start"></script>
	<script src="resources/js/require-config.js"></script>

	<?php @include_once("tracking.php"); ?>

</body>
</html>