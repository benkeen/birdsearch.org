<!DOCTYPE html>
<html>
<head>
	<title>eBird Search</title>
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
		<span id="loadingSpinner"></span>
	</header>

	<section id="sidebar">
		<div class="sidebarSection">
			<input type="text" id="searchTextField" />

			<ul id="resultType">
				<li><input type="radio" name="resultType" id="rt1" checked="checked" /><label for="rt1">All species</label></li>
				<li><input type="radio" name="resultType" id="rt2" /><label for="rt2">Notable species</label></li>
				<li><input type="radio" name="resultType" id="rt3" /><label for="rt3">Single species</label></li>
			</ul>

			<label>Show observations made within last:</label>
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
		</div>

		<div class="sidebarSection">
			<div id="numHotspotsFound"><span>0</span> hotspots found</div>
		</div>
		<div class="sidebarSection hidden" id="searchResults"></div>
		<div id="appInfo">
			<ul>
				<li><a href="http://ebird.org/content/ebird/" target="_blank"><img src="resources/images/ebird.png" title="Go to eBird.org" width="56" height="20" border="0"/></a></li>
				<li><a href="https://github.com/benkeen/eBirdAdvancedSearch/" id="github" target="_blank">Fork on github</a></li>
			</ul>
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

</body>
</html>