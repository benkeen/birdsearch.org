<!DOCTYPE html>
<html>
<head>
	<title>eBirdsearch.org</title>
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no">
	<link href="resources/css/bootstrap.css" rel="stylesheet" type="text/css" />
	<link href="resources/css/theme.bootstrap.css" rel="stylesheet" type="text/css" />
	<link href="resources/css/styles.css" rel="stylesheet" type="text/css" />
	<script src="resources/html5shiv.js"></script>
	<script src="resources/moment.min.js"></script>
	<script src="resources/jquery.min.js"></script>
	<script src="resources/jquery.tablesorter.min.js"></script>
	<script src="resources/jquery.tablesorter.widgets.js"></script>
	<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCrkl7BoiKPc5Kero35JCn7KilIFx-AWUg&sensor=false&libraries=places"></script>
	<script src="resources/manager.js"></script>
	<script src="resources/map.js"></script>
</head>
<body>

	<header id="topBar">
		<h1>eBird<span>search</span>.org</h1>
		<ul>
			<li><a href="">About</a></li>
			<li><a href="">Help</a></li>
		</ul>
	</header>

	<section id="sidebar">
		<div id="searchOptions" class="sidebarSection">
			<input type="text" id="searchTextField" />

			<label for="resultType">Result type:</label>
			<select id="resultType">
				<option value="all">All reported sightings</option>
				<option value="notable">Notable species</option>
				<option value="specific">Specific species</option>
			</select>

			<div id="specificSpeciesSection">
			</div>

			<label for="observationRecency">Show observations made within last:</label>
			<select id="observationRecency">
				<option value="1">1 day</option>
				<option value="2">2 days</option>
				<option value="3">3 days</option>
				<option value="4">4 days</option>
				<option value="5">5 days</option>
				<option value="6">6 days</option>
				<option value="7" selected="selected">7 days</option>
				<option value="10">10 days</option>
				<option value="15">15 days</option>
				<option value="20">20 days</option>
				<option value="25">25 days</option>
				<option value="30">30 days</option>
			</select>
			<span id="loadingSpinner"></span>
		</div>

		<div id="searchResultsSection" class="hidden">
			<div class="sidebarSection">
				<div id="numVisibleHotspots"><span>0</span> hotspots found</div>
			</div>
			<div class="sidebarSection hidden" id="searchResults"></div>
		</div>

	</section>

	<section id="mainPanel">
		<ul id="panelTabs">
			<li id="mapTab" class="selected">Map</li>
			<li id="birdSpeciesTab" class="disabled">Bird Species</li>
		</ul>
		<div id="panelContent">
			<div id="mapTabContent"></div>
			<div id="birdSpeciesTabContent" class="hidden">
				<div id="birdSpeciesTable"></div>
			</div>
		</div>
	</section>

	<footer>
		This site is not affiliated with <a href="http://ebird.org" target="_blank">eBird</a>.
	</footer>

</body>
</html>